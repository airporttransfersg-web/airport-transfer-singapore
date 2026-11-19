import {createHash} from 'node:crypto';
const ownerDomains = new Set(['hourlychauffeursingapore.com','limousineservicesingapore.com','singaporechauffeurservice.com','airporttransfersingapore.com','singaporef1chauffeur.com','cartoursingapore.com','blackcarservicesingapore.com','corporatecarservicesingapore.com']);
const normalize = value => value.replace(/\s+/g, ' ').trim();
export const articleBody = mdx => mdx.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
export const bodyDigest = mdx => createHash('sha256').update(articleBody(mdx)).digest('hex');
export const baselineDigest = ({facts,evidence,providers}) => createHash('sha256').update(JSON.stringify({facts,evidence,providers})).digest('hex');
export function verifyFactBaseline({mdx, facts, evidence, providers, audit, armed}) {
  const ids = new Set();
  for (const fact of facts) {
    const source = evidence[fact.url];
    const provider = providers.find(p => p.rank === fact.rank && p.name === fact.provider);
    if (!fact.id || ids.has(fact.id) || !provider?.pages.includes(fact.url)) throw Error(`Invalid fact identity/source: ${fact.id}`);
    ids.add(fact.id);
    const primaryHost = new URL(provider.home).hostname.replace(/^www\./, '');
    if (new URL(fact.url).hostname.replace(/^www\./, '') !== primaryHost) throw Error(`Fact is not on its provider primary domain: ${fact.id}`);
    const excerpt = typeof fact.snippet === 'string' && fact.snippet.trim();
    if (!source || !excerpt || ![source.text, ...source.blocks.map(b => b.text)].some(text => normalize(text).includes(normalize(excerpt)))) throw Error(`Fact excerpt is not verbatim preserved primary text: ${fact.id}`);
    if (!fact.sentences?.length || fact.sentences.some(sentence => !mdx.includes(sentence))) throw Error(`Fact carriers differ from article: ${fact.id}`);
    if (fact.sourceSha256 !== source.sha256 || fact.checkedAt !== source.checkedAt) throw Error(`Fact source metadata differs: ${fact.id}`);
    if (fact.type === 'price' && new URL(fact.url).hostname.replace(/^www\./, '') === 'mysingaporedriver.com') throw Error(`MSD rates are forbidden: ${fact.id}`);
    if (fact.type === 'price' && ownerDomains.has(new URL(fact.url).hostname.replace(/^www\./, '')) && (!fact.rateCardRef || !fact.rateCardSnippet)) throw Error(`Owner rate lacks approved card authority: ${fact.id}`);
    if (fact.type === 'absence') {
      if (!fact.alwaysReviewOnSourceChange || !fact.absenceScopeUrls?.length) throw Error(`Absence requires full source scope and change review: ${fact.id}`);
      for (const url of fact.absenceScopeUrls) {
        if (!provider.pages.includes(url) || !evidence[url] || new URL(url).hostname.replace(/^www\./, '') !== primaryHost) throw Error(`Missing absence scope: ${fact.id}`);
        for (const pattern of fact.absencePatterns ?? [fact.absencePattern]) {
          const scoped=evidence[url];
          if(scoped.mode==='verified-primary-excerpts') {
            const scan=scoped.absenceScans?.find(scan=>scan.pattern===pattern);
            if(!pattern || !scoped.fullTextSha256 || scoped.fullTextLength<150 || !scan || scan.matched!==false || scan.scope!=='complete-visible-primary-page') throw Error(`Absence lacks full-page verification: ${fact.id}`);
          } else if (!pattern || new RegExp(pattern, 'i').test(scoped.text)) throw Error(`Absence contradicted in preserved source: ${fact.id}`);
        }
      }
    }
    if (fact.calculation) {
      const {operator,inputs,result} = fact.calculation;
      const calculated = operator === 'multiply' ? inputs[0] * inputs[1] : operator === 'divide' ? inputs[0] / inputs[1] : NaN;
      if (inputs.length !== 2 || !inputs.every(Number.isFinite) || !Number.isFinite(result) || calculated !== result) throw Error(`Invalid worked arithmetic: ${fact.id}`);
    }
    if (fact.comparison) {
      const {operator,inputs,result} = fact.comparison;
      const known = ['min','lessThan','greaterThan','pairwiseLessThan'].includes(operator);
      const calculated = operator === 'min' ? Math.min(...inputs) : operator === 'lessThan' ? inputs[0] < inputs[1] : operator === 'greaterThan' ? inputs[0] > inputs[1] : operator === 'pairwiseLessThan' && inputs.length === 4 ? [inputs[0]<inputs[1],inputs[2]<inputs[3]] : undefined;
      if (!known || !inputs.length || !inputs.every(Number.isFinite) || JSON.stringify(calculated) !== JSON.stringify(result) || !fact.protectedFromAutomaticChange) throw Error(`Invalid or unprotected comparison: ${fact.id}`);
    }
    if (fact.derivedCount && (new Set(fact.derivedCount.classes).size !== fact.derivedCount.result || fact.derivedCount.classes.some(name => !normalize(fact.snippet).includes(name)))) throw Error(`Invalid derived fleet count: ${fact.id}`);
  }
  const byId = new Map(facts.map(fact => [fact.id,fact])), visiting = new Set(), visited = new Set();
  function visit(id) {
    if (visiting.has(id) || !byId.has(id)) throw Error(`Missing or circular fact dependency: ${id}`);
    if (visited.has(id)) return;
    visiting.add(id); for (const dependency of byId.get(id).dependencies ?? []) visit(dependency);
    visiting.delete(id); visited.add(id);
  }
  for (const fact of facts) visit(fact.id);
  if (armed && (audit.complete !== true || audit.bodySha256 !== bodyDigest(mdx) || audit.baselineSha256 !== baselineDigest({facts,evidence,providers}) || new Set(facts.map(fact => fact.rank)).size !== providers.length || audit.unresolved?.length)) throw Error('Complete manually reviewed fact coverage for the exact article body is required before arming');
  return facts.length;
}

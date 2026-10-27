export function reviewMarkup(options={}) {
 return tree=>{
  if(!JSON.stringify(tree).includes('data-listicle-review'))return;
  const text=n=>(n.children??[]).map(c=>c.value??text(c)).join('');
  function visit(node){
   if(node.type==='text')node.value=node.value.replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/(\d)[–—](?=\d)/g,'$1 to ').replace(/[–—]/g,' - ');
   if(!Array.isArray(node.children))return;
   node.children=node.children.map(child=>{
    visit(child);
    if(child.tagName==='a'&&/^(?:https?:)?\/\//.test(child.properties?.href??'')){
     const url=new URL(child.properties.href,options.site);
     if(url.origin===new URL(options.site).origin)child.properties.href=url.pathname+url.search+url.hash;
     else{child.tagName='span';child.properties={};}
    }
    if(child.tagName==='table'){
     const count=child.children?.find(n=>n.tagName==='thead')?.children?.find(n=>n.tagName==='tr')?.children?.filter(n=>['th','td'].includes(n.tagName)).length??2;
     child.properties={...child.properties,className:['review-table',`review-table--${count}`]};
     return {type:'element',tagName:'div',properties:{className:['review-table-scroll'],role:'region',tabIndex:0,ariaLabel:'Comparison table, scroll horizontally'},children:[child]};
    }
    return child;
   });
  }
  visit(tree);
 };
}

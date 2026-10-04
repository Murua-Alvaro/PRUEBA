window.MigajerosDemand={
  apiBase:'https://miga-api-l5f1.onrender.com',
  async request(path,options={}){
    const response=await fetch(this.apiBase+path,{cache:'no-store',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'Error');
    return data;
  }
};

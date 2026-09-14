(function(){
  var SB='https://bxdnxnwbslykpgfsdltg.supabase.co';
  var KEY='sb_publishable_gG8DLCGoOZ1fUBBx566k1w_BlW-eZth';
  var sid,vid;
  function nid(){return Math.random().toString(36).slice(2)+Date.now().toString(36);}
  try{sid=sessionStorage.getItem('eeml_sid');if(!sid){sid=nid();sessionStorage.setItem('eeml_sid',sid);}}catch(e){sid='a'+Date.now();}
  try{vid=localStorage.getItem('eeml_vid');if(!vid){vid=nid();localStorage.setItem('eeml_vid',vid);}}catch(e){vid=sid;}
  function appareil(){var u=navigator.userAgent;
    if(/iPad|Tablet/i.test(u))return 'tablette';
    if(/Mobi|Android|iPhone/i.test(u))return 'mobile';return 'ordinateur';}
  function envoyer(ev,chemin,duree){
    var d={evenement:ev,chemin:chemin||location.pathname,session_id:sid,visiteur_id:vid,
           appareil:appareil(),referent:(document.referrer||'').replace(/^https?:\/\//,'').split('/')[0]};
    if(duree)d.duree_s=duree;
    var corps=JSON.stringify(d);
    if(ev==='duree'&&navigator.sendBeacon){
      navigator.sendBeacon('/api/visite', new Blob([corps],{type:'application/json'}));return;
    }
    fetch('/api/visite',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:corps})
      .then(function(r){if(r.ok)return;
        return fetch(SB+'/rest/v1/eeml_visites',{method:'POST',keepalive:true,
          headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+KEY,'Prefer':'return=minimal'},
          body:corps});}).catch(function(){});
  }
  envoyer('vue');
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a'); if(!a)return;
    var h=a.getAttribute('href')||'';
    if(h.indexOf('mailto:')===0)envoyer('clic','mail');
    else if(h.indexOf('tel:')===0)envoyer('clic','telephone');
    else if(h.indexOf('chat.whatsapp.com')>-1)envoyer('clic','whatsapp');
  },true);
  var cumul=0,depart=Date.now(),actif=!document.hidden,envoye=0;
  function stop(){if(actif){cumul+=Date.now()-depart;actif=false;}}
  function start(){if(!actif){depart=Date.now();actif=true;}}
  function sec(){return Math.round((cumul+(actif?Date.now()-depart:0))/1000);}
  function remonter(){var s=sec();if(s<3||s<=envoye+4)return;envoye=s;envoyer('duree','/',s);}
  document.addEventListener('visibilitychange',function(){document.hidden?(stop(),remonter()):start();});
  setInterval(remonter,15000);
  window.addEventListener('pagehide',remonter);
})();

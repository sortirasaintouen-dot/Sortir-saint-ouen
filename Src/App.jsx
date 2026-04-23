import { useState, useEffect } from "react";

// â”€â”€ CONFIG â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const ADMIN_PASSWORD = "onyva2026";
const EVENTS_KEY = "saso_events_v4";
const REQUESTS_KEY = "saso_requests_v2";
const LIKES_KEY = "saso_likes_v2";
const R = "#C8231B"; // rouge principal

// Liens HelloAsso
const HELLOASSO_PAYMENT_URL = "https://www.helloasso.com/associations/sortir-a-saint-ouen/formulaires/3";
const HELLOASSO_BOOST_URL = "https://www.helloasso.com/associations/sortir-a-saint-ouen/formulaires/4";
const TARIF_PUBLICATION = "10â‚¬";
const TARIF_BOOST = "10â‚¬";

const CATEGORIES = ["Concert","Expo","Marché","Fête","Sport","Culture","Soirée","Spectacle","Autre"];
const CAT_COL = {
  Concert:"#c0392b", Expo:"#2980b9", Marché:"#e67e22", Fête:"#8e44ad",
  Sport:"#27ae60", Culture:"#16a085", Soirée:"#c0392b", Spectacle:"#d35400", Autre:"#7f8c8d",
};

// ←← INJECTER CSS ← ...
(fonction injectCSS() {
  si (document.getElementById("saso-css")) retourner;
  const s = document.createElement("style");
  s.id = "saso-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    * { box-sizing:border-box }
    corps { marge:0; arrière-plan:#f9f4f0 }
    .ecard { transition:transform .2s,box-shadow .2s; animation:fadeUp .4s both }
    .ecard:hover { transform:translateY(-5px)!important; box-shadow:0 12px 32px rgba(200,35,27,.15)!important }
    .ecard.boosted { border:2.5px solid #e67e22!important }
    .boost-label { display:none; align-items:center; gap:5px; background:#fff3cd; color:#c47d00;
      taille de police : 0,68 rem ; graisse de police : 800 ; espacement des lettres : 0,08 em ; marge intérieure : 4 px 12 px ;
      margin:-20px -20px 14px; border-bottom:1px solid #ffe082; font-family:'Nunito',sans-serif }
    .ecard.boosted .boost-label { display:flex!important }
    .like-btn { background:none; border:none; cursor:pointer; font-size:1.1rem; padding:0; line-height:1; transition:transform .15s }
    .like-btn:hover { transform:scale(1.3) }
    .ha-btn { display:inline-flex; align-items:center; gap:8px; background:#ff6b35; color:#fff;
      marge intérieure : 11 px 22 px ; bordure arrondie : 6 px ; taille de police : 0,9 rem ; épaisseur de police : 800 ; décoration de texte : aucune ;
      font-family:'Nunito',sans-serif; transition:opacity .2s }
    .ha-btn:hover { opacité:.85 }
    .soc-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:6px;
      font-size:.85rem; font-weight:700; text-decoration:none; font-family:'Nunito',sans-serif; transition:opacity .2s }
    .soc-btn:hover { opacité:.8 }
    .atab { background:none; border:none; cursor:pointer; padding:8px 0; font-family:'Nunito',sans-serif;
      font-size:.85rem; font-weight:700; border-bottom:3px solid transparent; color:#888; transition:all .2s }
    .atab.on { color:#C8231B; border-bottom-color:#C8231B }
    .req-card { background:#fff; border:1px solid #e8e0d8; border-radius:8px; padding:16px; margin-bottom:12px }
    .req-card.pending { border-left:4px solid #e67e22 }
    input:focus, select:focus, textarea:focus { outline:none; border-color:#C8231B!important; box-shadow:0 0 0 3px rgba(200,35,27,.1)!important }
    bouton:actif { transformation:échelle(.97) }
  `;
  document.head.appendChild(s);
})();

// ✓✓✓ DONNÉES D'EXEMPLE ✓ ...
const ÉCHANTILLONS = [
  { id:"s1", titre:"Jazz aux Puces", date:"2026-05-03", heure:"14:00",
    lieu:"Marché Paul Bert", adresse:"96 rue des Rosiers, Saint-Ouen",
    categorie:"Concert", description:"Après-midi jazz en plein air. Entrée libre !",
    gratuit:true, prix:"", helloasso:"", instagram:"https://instagram.com", facebook:"",
    boosté:true, publié:true, crééÀ:Date.now()-86400000 },
  { id:"s2", title:"Expo Photo : Saint-Ouen en mutation", date:"2026-05-10", time:"11:00",
    lieu:"Mains d'Å'uvres", adresse:"1 rue Charles Garnier, Saint-Ouen",
    categorie:"Expo", description:"25 photographies documentent les transformations urbaines depuis 10 ans.",
    gratuit:false, prix:"5â‚¬", helloasso:"https://www.helloasso.com", instagram:"", facebook:"https://facebook.com",
    boosté : false, publié : true, créé à : Date.now()-43200000 },
  { id:"s3", titre:"Vide-grenier du Parc", date:"2026-05-17", heure:"08:00",
    lieu:"Parc Henri Barbusse", adresse:"Parc Henri Barbusse, Saint-Ouen",
    categorie:"Marché", description:"Grand vide-grenier annuel. Inscriptions exposants ouverts.",
    gratuit:true, prix:"", helloasso:"", instagram:"", facebook:"",
    boosté:false, publié:true, crééÀ:Date.now() },
];

const EMPTY_EVT = { title:"",date:"",time:"",lieu:"",adresse:"",categorie:"Concert",
  description:"",gratuit:true,prix:"",helloasso:"",instagram:"",facebook:"",boosted:false,published:true };
const EMPTY_REQ = { nom:"", email:"", titre:"", date:"", heure:"", lieu:"", adresse:"", catégorie:"Concert",
  description:"",prix:"",helloasso:"",instagram:"",facebook:"",message:"" };

// â"€â"€ AIDES â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
fonction fmtDate(s) {
  return new Date(s+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}
fonction estFutur(s) {
  const t = new Date(); t.setHours(0,0,0,0);
  retourner une nouvelle Date(s+"T00:00:00") >= t;
}
fonction Logo({ taille=48 }) {
  retour (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill={R}/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="8 5"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="5 4"/>
      <text x="50" y="40" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Bebas Neue,sans-serif">TRIBER Ã€</text>
      <text x="50" y="58" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="Bebas Neue,sans-serif">SAINT-OUEN</text>
      <text x="50" y="72" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Nunito,sans-serif">#ONYVA</text>
    </svg>
  );
}
fonction Modal({ enfants, à la fermeture }) {
  retour (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}
      onClick={onClose}>
      <div style={{background:"#fff",borderRadius:12,padding:28,maxWidth:430,width:"90%",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}
        onClick={e=>e.stopPropagation()}>
        {enfants}
      </div>
    </div>
  );
}
fonction Champ({ étiquette, enfants }) {
  retour (
    <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:180}}>
      <label style={{fontSize:".74rem",fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:".04em",fontFamily:"Nunito,sans-serif"}}>{label}</label>
      {enfants}
    </div>
  );
}
const iStyle = { border:"1.5px solid #ddd",borderRadius:6,padding:"10px 13px",fontSize:".93rem",
  fontFamily:"Nunito,sans-serif",background:"#fff",outline:"none",width:"100%",boxSizing:"border-box",fontWeight:600 };
const sbtn = (bg) => ({ background:bg,color:"#fff",border:"none",padding:"7px 14px",borderRadius:5,
  cursor:"pointer",fontWeight:800,fontSize:".82rem",fontFamily:"Nunito,sans-serif" });

// ✓✓✓ APPLICATION PRINCIPALE ✓ ...
export default function App() {
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [likes, setLikes] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("agenda");
  const [sélectionné, setSelected] = useState(null);
  const [filterCat,setFilterCat] = useState("Tous");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [aTab, setATab] = useState("events");
  const [evtForm, setEvtForm] = useState(EMPTY_EVT);
  const [reqForm, setReqForm] = useState(EMPTY_REQ);
  const [reqDone, setReqDone] = useState(false);
  const [editId, setEditId] = useState(null);
  const [boostMod, setBoostMod] = useState(null);
  const [delMod, setDelMod] = useState(null);
  const [likedSet, setLikedSet] = useState(new Set());

  utiliserEffect(() => {
    (async () => {
      essayer {
        const [er, rr, lr] = await Promise.all([
          window.storage.get(EVENTS_KEY, true).catch(() => null),
          window.storage.get(REQUESTS_KEY, true).catch(() => null),
          window.storage.get(LIKES_KEY, true).catch(() => null),
        ]);
        setEvents( euh ? JSON.parse(er.value) : SAMPLES);
        setRequests(rr ? JSON.parse(rr.value) : []);
        setLikes( lr ? JSON.parse(lr.value) : {});
      } catch { setEvents(SAMPLES); }
      définirChargement(false);
    })();
  }, []);

  fonction asynchrone saveE(evts) { try { await window.storage.set(EVENTS_KEY, JSON.stringify(evts), true); } catch {} setEvents(evts); }
  fonction asynchrone saveR(reqs) { try { await window.storage.set(REQUESTS_KEY, JSON.stringify(reqs), true); } catch {} setRequests(reqs); }
  fonction asynchrone saveL(lks) { try { await window.storage.set(LIKES_KEY, JSON.stringify(lks), true); } catch {} setLikes(lks); }

  fonction login() {
    if (pwInput === ADMIN_PASSWORD) { setIsAdmin(true); setView("admin"); setPwError(false); setPwInput(""); }
    sinon setPwError(true);
  }

  fonction toggleLike(id, e) {
    e.stopPropagation();
    si (likedSet.has(id)) retourner;
    const nl = { ...likes, [id]: (likes[id]||0)+1 };
    enregistrerL(nl);
    setLikedSet(prev => new Set([...prev, id]));
  }

  fonction publishEvent() {
    si (!evtForm.title || !evtForm.date || !evtForm.lieu) retourner;
    laisser mis à jour;
    si (editId) {
      mis à jour = événements.map(e => e.id === editId ? { ...evtForm, id:editId, createdAt:e.createdAt } : e);
      définirEditId(null);
    } autre {
      mis à jour = [...événements, { ...evtForm, id:`e-${Date.now()}`, crééÀ:Date.now() }];
    }
    enregistrerE(mis à jour.sort((a,b) => a.date.localeCompare(b.date)));
    définirEvtForm(EMPTY_EVT);
    setATab("événements");
  }

  fonction supprimerÉvénement(id) {
    enregistrerE(événements.filter(e => e.id !== id));
    définirDelMod(null);
    si (selected?.id === id) setView("admin");
  }

  fonction doBoost(id) {
    const updated = events.map(e => e.id === id ? { ...e, boosted:!e.boosted } : e);
    enregistrerE(mis à jour);
    setBoostMod(null);
    si (selected?.id === id) setSelected(prev => ({ ...prev, boosted:!prev.boosted }));
  }

  fonction approuveRequest(req) {
    setEvtForm({ title:req.title, date:req.date, time:req.time, lieu:req.lieu, adresse:req.adresse,
      catégorie:req.categorie, description:req.description, gratuit:!req.prix, prix:req.prix,
      helloasso:req.helloasso, instagram:req.instagram, facebook:req.facebook, boosted:false, published:true });
    définirEditId(null);
    définirATab("nouveau");
    saveR(requests.map(r => r.id === req.id ? { ...r, status:"approved" } : r));
  }

  fonction rejectRequest(id) {
    saveR(requests.map(r => r.id === id ? { ...r, status:"rejected" } : r));
  }

  fonction submitRequest() {
    si (!reqForm.name || !reqForm.email || !reqForm.title || !reqForm.date) retourner;
    saveR([...requests, { ...reqForm, id:`req-${Date.now()}`, status:"pending", createdAt:Date.now() }]);
    setReqDone(true);
    définirReqForm(REQ_VIDE);
  }

  const pubEvents = événements
    .filter(e => e.published && isFuture(e.date))
    .filter(e => filterCat === "Tous" || e.categorie === filterCat)
    .sort((a,b) => {
      si (a.boosted && !b.boosted) retourner -1 ;
      si (!a.boosted && b.boosted) retourner 1 ;
      retourner a.date.localeCompare(b.date);
    });

  const pendingN = requests.filter(r => r.status === "pending").length;

  // ←← CHARGEMENT ←←
  si (chargement) retourner (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#f9f4f0"}}>
      <div style={{width:40,height:40,border:"4px solid #eee",borderTopColor:R,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    </div>
  );

  const hdr = (
    <header style={{background:R,boxShadow:"0 4px 20px rgba(200,35,27,.35)",position:"sticky",top:0,zIndex:100}}>
      <div style={{maxWidth:980,margin:"0 auto",padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setView("agenda")}>
          <Logo size={42}/>
          <div style={{lineHeight:1.1}}>
            <div style={{color:"#fff",fontSize:"1.15rem",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:".1em"}}>SORTIR À SAINT-OUEN</div>
            <div style={{color:"rgba(255,255,255,.75)",fontSize:".7rem",fontWeight:700,letterSpacing:".2em",fontFamily:"Nunito,sans-serif"}}>#ONYVA</div>
          </div>
        </div>
        <nav style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setView("agenda")} style={{background:view==="agenda"?"rgba(255,255,255,.25)":"none",border:"1.5px solid rgba(255,255,255,.4)",color:"#fff",padding:"7px 14px",borderRadius:5,cursor:"pointer",fontSize:".82rem",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>Agenda</button>
          <button onClick={()=>setView("request")} style={{background:"rgba(255,255,255,.2)",border:"1.5px solid rgba(255,255,255,.5)",color:"#fff",padding:"7px 14px",borderRadius:5,cursor:"pointer",fontSize:".82rem",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>ðŸ“© Proposer</button>
          {isAdmin
            ? <button onClick={()=>setView("admin")} style={{background:"rgba(255,255,255,.2)",border:"1.5px solid rgba(255,255,255,.5)",color:"#fff",padding:"7px 14px",borderRadius:5,cursor:"pointer",fontSize:".82rem",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>™ Admin{pendingN>0?` (${pendingN})`:""}</button>
            : <button onClick={()=>setView("login")} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:".78rem",fontFamily:"Nunito,sans-serif"}}>Admin</button>
          }
        </nav>
      </div>
    </header>
  );

  const backB = (dest="agenda") => (
    <button onClick={()=>setView(dest)} style={{background:"none",border:"none",cursor:"pointer",color:R,fontSize:".9rem",padding:"0 0 20px",fontWeight:800,fontFamily:"Nunito,sans-serif",display:"block"}}>→ Retour</button>
  );

  // â”€â”€ ORDRE DU JOUR â”€â”€
  si (vue === "agenda") retourner (
    <div style={{fontFamily:"Nunito,sans-serif",background:"#f9f4f0",minHeight:"100vh"}}>
      {hdr}
      <main style={{maxWidth:980,margin:"0 auto",padding:"0 20px 60px"}}>
        <div style={{textAlign:"center",padding:"48px 0 34px",borderBottom:"2px dashed #e8ded5",marginBottom:28}}>
          <Logo size={88}/>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.6rem,8vw,5rem)",color:R,margin:"12px 0 4px",letterSpacing:".05em",lineHeight:1}}>Sortir à Saint-Ouen</h1>
          <p style={{color:"#aaa",fontSize:".9rem",fontWeight:700,margin:0,letterSpacing:".12em",fontFamily:"Nunito,sans-serif"}}>#ONYVA · {pubEvents.length} événement{pubEvents.length!==1?"s":""} à venir</p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:26}}>
          {["Tous",...CATÉGORIES].map(c => (
            <button key={c} onClick={()=>setFilterCat(c)} style={{
              border:`1.5px solid ${filterCat===c?(c==="Tous"?"#1a1a1a):CAT_COL[c]):"#ddd"}`,
              arrière-plan:filterCat===c?(c==="Tous"?"#1a1a1a):CAT_COL[c]):"#fff",
              color:filterCat===c?"#fff":"#666",padding:"5px 15px",borderRadius:20,
              cursor:"pointer",fontSize:".8rem",fontWeight:700,fontFamily:"Nunito,sans-serif",transition:"all .15s"
            }}>{c}</button>
          ))}
        </div>

        {pubEvents.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 0",color:"#bbb"}}>
            <div style={{fontSize:"3rem",marginBottom:12}}>ðŸ“</div>
            <p style={{fontWeight:700}}>Aucun événement pour l'instant.</p>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:20}}>
            {pubEvents.map((evt,i) => (
              <article key={evt.id} className={`ecard${evt.boosted?" boosted":""}`}
                style={{background:"#fff",border:"1.5px solid #ede7df",borderRadius:10,padding:20,cursor:"pointer",animationDelay:`${i*50}ms`}}
                onClick={()=>{setSelected(evt);setView("détail");}}>
                <div className="boost-label">â Ã€ LA UNE</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{background:CAT_COL[evt.categorie]||R,color:"#fff",fontSize:".68rem",fontWeight:800,letterSpacing:".06em",padding:"3px 10px",borderRadius:4,textTransform:"uppercase"}}>{evt.categorie}</span>
                  <span style={{fontSize:".76rem",color:"#bbb",fontWeight:600}}>{fmtDate(evt.date)}</span>
                </div>
                <h2 style={{fontSize:"1.05rem",fontWeight:800,margin:"0 0 8px",lineHeight:1.3,color:"#1a1a1a"}}>{evt.title}</h2>
                <div style={{fontSize:".8rem",color:"#888",marginBottom:8,display:"flex",gap:10,flexWrap:"wrap"}}>
                  <span>ðŸ“ {evt.lieu}</span>{evt.time&&<span>ðŸ• {evt.time}</span>}
                </div>
                {evt.description && <p style={{fontSize:".82rem",color:"#999",lineHeight:1.5,margin:"0 0 12px"}}>{evt.description.length>85?evt.description.slice(0,85)+"…":evt.description}</p>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #f0ebe5",paddingTop:10}}>
                  <span style={{fontSize:".74rem",fontWeight:800,padding:"3px 10px",borderRadius:4,background:evt.gratuit?"#e8f5e9":"#fff3e0",color:evt.gratuit?"#2e7d32":"#e65100"}}>
                    {evt.gratuit?"Entrée libre":evt.prix||"Payant"}
                  </span>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button className="like-btn" onClick={e=>toggleLike(evt.id,e)}>
                      {likedSet.has(evt.id)?"â ¤ï¸ ":"ðŸ¤ "} <span style={{fontSize:".72rem",color:"#bbb",fontWeight:700}}>{likes[evt.id]||0}</span>
                    </button>
                    <span style={{fontSize:".8rem",color:R,fontWeight:800}}>Voir →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <footer style={{background:R,color:"rgba(255,255,255,.8)",textAlign:"center",padding:"16px 20px",fontSize:".78rem",fontWeight:700,letterSpacing:".1em",fontFamily:"Nunito,sans-serif"}}>SORTIR À SAINT-OUEN · #ONYVA · 93400</footer>
    </div>
  );

  // â”€â”€ DÉTAIL â”€â”€
  si (vue === "détail" && sélectionné) retourner (
    <div style={{fontFamily:"Nunito,sans-serif",background:"#f9f4f0",minHeight:"100vh"}}>
      {hdr}
      <main style={{maxWidth:980,margin:"0 auto",padding:"30px 20px 60px"}}>
        {backB()}
        <div style={{background:"#fff",border:"1.5px solid #ede7df",borderRadius:12,padding:32,maxWidth:640,margin:"0 auto"}}>
          {selected.boosted&&<div style={{background:"#fff3cd",color:"#c47d00",fontWeight:800,fontSize:".8rem",padding:"6px 14px",borderRadius:5,marginBottom:16,borderLeft:"3px solid #e67e22"}}>â Ã‰vÃ©nement mis à la une</div>}
          <span style={{background:CAT_COL[selecte

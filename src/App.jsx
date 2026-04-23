import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "onyva2026";
const EVENTS_KEY     = "saso_events_v4";
const REQUESTS_KEY   = "saso_requests_v2";
const LIKES_KEY      = "saso_likes_v2";
const R              = "#C8231B";

const HELLOASSO_PAYMENT_URL = "https://www.helloasso.com/associations/sortir-a-saint-ouen/formulaires/3";
const HELLOASSO_BOOST_URL   = "https://www.helloasso.com/associations/sortir-a-saint-ouen/formulaires/4";
const TARIF_PUBLICATION = "10€";
const TARIF_BOOST       = "10€";
const CATEGORIES = ["Concert","Expo","Marché","Fête","Sport","Culture","Soirée","Spectacle","Autre"];
const CAT_COL = {
  Concert:"#c0392b", Expo:"#2980b9", Marché:"#e67e22", Fête:"#8e44ad",
  Sport:"#27ae60", Culture:"#16a085", Soirée:"#c0392b", Spectacle:"#d35400", Autre:"#7f8c8d",
};

(function injectCSS() {
  if (document.getElementById("saso-css")) return;
  const s = document.createElement("style");
  s.id = "saso-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    * { box-sizing:border-box }
    body { margin:0; background:#f9f4f0 }
    .ecard { transition:transform .2s,box-shadow .2s; animation:fadeUp .4s both }
    .ecard:hover { transform:translateY(-5px)!important; box-shadow:0 12px 32px rgba(200,35,27,.15)!important }
    .ecard.boosted { border:2.5px solid #e67e22!important }
    .boost-label { display:none; align-items:center; gap:5px; background:#fff3cd; color:#c47d00;
      font-size:.68rem; font-weight:800; letter-spacing:.08em; padding:4px 12px;
      margin:-20px -20px 14px; border-bottom:1px solid #ffe082; font-family:'Nunito',sans-serif }
    .ecard.boosted .boost-label { display:flex!important }
    .like-btn { background:none; border:none; cursor:pointer; font-size:1.1rem; padding:0; line-height:1; transition:transform .15s }
    .like-btn:hover { transform:scale(1.3) }
    .ha-btn { display:inline-flex; align-items:center; gap:8px; background:#ff6b35; color:#fff;
      padding:11px 22px; border-radius:6px; font-size:.9rem; font-weight:800; text-decoration:none;
      font-family:'Nunito',sans-serif; transition:opacity .2s }
    .ha-btn:hover { opacity:.85 }
    .soc-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:6px;
      font-size:.85rem; font-weight:700; text-decoration:none; font-family:'Nunito',sans-serif; transition:opacity .2s }
    .soc-btn:hover { opacity:.8 }
    .atab { background:none; border:none; cursor:pointer; padding:8px 0; font-family:'Nunito',sans-serif;
      font-size:.85rem; font-weight:700; border-bottom:3px solid transparent; color:#888; transition:all .2s }
    .atab.on { color:#C8231B; border-bottom-color:#C8231B }
    .req-card { background:#fff; border:1px solid #e8e0d8; border-radius:8px; padding:16px; margin-bottom:12px }
    .req-card.pending { border-left:4px solid #e67e22 }
    input:focus, select:focus, textarea:focus { outline:none; border-color:#C8231B!important; box-shadow:0 0 0 3px rgba(200,35,27,.1)!important }
    button:active { transform:scale(.97) }
  `;
  document.head.appendChild(s);
})();
const SAMPLES = [
  { id:"s1", title:"Jazz aux Puces", date:"2026-05-03", time:"14:00",
    lieu:"Marché Paul Bert", adresse:"96 rue des Rosiers, Saint-Ouen",
    categorie:"Concert", description:"Après-midi jazz en plein air. Entrée libre !",
    gratuit:true, prix:"", helloasso:"", instagram:"", facebook:"",
    boosted:true, published:true, createdAt:Date.now()-86400000 },
  { id:"s2", title:"Expo Photo : Saint-Ouen en mutation", date:"2026-05-10", time:"11:00",
    lieu:"Mains d'Œuvres", adresse:"1 rue Charles Garnier, Saint-Ouen",
    categorie:"Expo", description:"25 photographes documentent les transformations urbaines depuis 10 ans.",
    gratuit:false, prix:"5€", helloasso:"https://www.helloasso.com", instagram:"", facebook:"",
    boosted:false, published:true, createdAt:Date.now()-43200000 },
  { id:"s3", title:"Vide-grenier du Parc", date:"2026-05-17", time:"08:00",
    lieu:"Parc Henri Barbusse", adresse:"Parc Henri Barbusse, Saint-Ouen",
    categorie:"Marché", description:"Grand vide-grenier annuel. Inscriptions exposants ouvertes.",
    gratuit:true, prix:"", helloasso:"", instagram:"", facebook:"",
    boosted:false, published:true, createdAt:Date.now() },
];

const EMPTY_EVT = { title:"",date:"",time:"",lieu:"",adresse:"",categorie:"Concert",
  description:"",gratuit:true,prix:"",helloasso:"",instagram:"",facebook:"",boosted:false,published:true };
const EMPTY_REQ = { name:"",email:"",title:"",date:"",time:"",lieu:"",adresse:"",categorie:"Concert",
  description:"",prix:"",helloasso:"",instagram:"",facebook:"",message:"" };

function fmtDate(s) {
  return new Date(s+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
}
function isFuture(s) {
  const t = new Date(); t.setHours(0,0,0,0);
  return new Date(s+"T00:00:00") >= t;
}
function Logo({ size=48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill={R}/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="2.5" strokeDasharray="8 5"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="5 4"/>
      <text x="50" y="40" textAnchor="middle" fill="white" fontSize="16" fontWeight="900" fontFamily="Bebas Neue,sans-serif">SORTIR À</text>
      <text x="50" y="58" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="Bebas Neue,sans-serif">SAINT-OUEN</text>
      <text x="50" y="72" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Nunito,sans-serif">#ONYVA</text>
    </svg>
  );
}
function Modal({ children, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}
      onClick={onClose}>
      <div style={{background:"#fff",borderRadius:12,padding:28,maxWidth:430,width:"90%",boxShadow:"0 20px 60px rgba(0,0,0,.25)"}}
        onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:180}}>
      <label style={{fontSize:".74rem",fontWeight:800,color:"#888",textTransform:"uppercase",letterSpacing:".04em",fontFamily:"Nunito,sans-serif"}}>{label}</label>
      {children}
    </div>
  );
}
const iStyle = { border:"1.5px solid #ddd",borderRadius:6,padding:"10px 13px",fontSize:".93rem",
  fontFamily:"Nunito,sans-serif",background:"#fff",outline:"none",width:"100%",boxSizing:"border-box",fontWeight:600 };
const sbtn = (bg) => ({ background:bg,color:"#fff",border:"none",padding:"7px 14px",borderRadius:5,
  cursor:"pointer",fontWeight:800,fontSize:".82rem",fontFamily:"Nunito,sans-serif" });
export default function App() {
  const [events,   setEvents]    = useState([]);
  const [requests, setRequests]  = useState([]);
  const [likes,    setLikes]     = useState({});
  const [loading,  setLoading]   = useState(true);
  const [view,     setView]      = useState("agenda");
  const [selected, setSelected]  = useState(null);
  const [filterCat,setFilterCat] = useState("Tous");
  const [isAdmin,  setIsAdmin]   = useState(false);
  const [pwInput,  setPwInput]   = useState("");
  const [pwError,  setPwError]   = useState(false);
  const [aTab,     setATab]      = useState("events");
  const [evtForm,  setEvtForm]   = useState(EMPTY_EVT);
  const [reqForm,  setReqForm]   = useState(EMPTY_REQ);
  const [reqDone,  setReqDone]   = useState(false);
  const [editId,   setEditId]    = useState(null);
  const [boostMod, setBoostMod]  = useState(null);
  const [delMod,   setDelMod]    = useState(null);
  const [likedSet, setLikedSet]  = useState(new Set());

  useEffect(() => {
    try {
      const er = localStorage.getItem(EVENTS_KEY);
      const rr = localStorage.getItem(REQUESTS_KEY);
      const lr = localStorage.getItem(LIKES_KEY);
      setEvents(  er ? JSON.parse(er) : SAMPLES);
      setRequests(rr ? JSON.parse(rr) : []);
      setLikes(   lr ? JSON.parse(lr) : {});
    } catch { setEvents(SAMPLES); }
    setLoading(false);
  }, []);

  function saveE(evts) { try { localStorage.setItem(EVENTS_KEY,   JSON.stringify(evts)); } catch {} setEvents(evts); }
  function saveR(reqs) { try { localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs)); } catch {} setRequests(reqs); }
  function saveL(lks)  { try { localStorage.setItem(LIKES_KEY,    JSON.stringify(lks));  } catch {} setLikes(lks); }

  function login() {
    if (pwInput === ADMIN_PASSWORD) { setIsAdmin(true); setView("admin"); setPwError(false); setPwInput(""); }
    else setPwError(true);
  }

  function toggleLike(id, e) {
    e.stopPropagation();
    if (likedSet.has(id)) return;
    const nl = { ...likes, [id]: (likes[id]||0)+1 };
    saveL(nl);
    setLikedSet(prev => new Set([...prev, id]));
  }

  function publishEvent() {
    if (!evtForm.title || !evtForm.date || !evtForm.lieu) return;
    let updated;
    if (editId) {
      updated = events.map(e => e.id === editId ? { ...evtForm, id:editId, createdAt:e.createdAt } : e);
      setEditId(null);
    } else {
      updated = [...events, { ...evtForm, id:`e-${Date.now()}`, createdAt:Date.now() }];
    }
    saveE(updated.sort((a,b) => a.date.localeCompare(b.date)));
    setEvtForm(EMPTY_EVT);
    setATab("events");
  }

  function deleteEvent(id) {
    saveE(events.filter(e => e.id !== id));
    setDelMod(null);
    if (selected?.id === id) setView("admin");
  }

  function doBoost(id) {
    const updated = events.map(e => e.id === id ? { ...e, boosted:!e.boosted } : e);
    saveE(updated);
    setBoostMod(null);
    if (selected?.id === id) setSelected(prev => ({ ...prev, boosted:!prev.boosted }));
  }

  function approveRequest(req) {
    setEvtForm({ title:req.title, date:req.date, time:req.time, lieu:req.lieu, adresse:req.adresse,
      categorie:req.categorie, description:req.description, gratuit:!req.prix, prix:req.prix,
      helloasso:req.helloasso, instagram:req.instagram, facebook:req.facebook, boosted:false, published:true });
    setEditId(null);
    setATab("new");
    saveR(requests.map(r => r.id === req.id ? { ...r, status:"approved" } : r));
  }

  function rejectRequest(id) {
    saveR(requests.map(r => r.id === id ? { ...r, status:"rejected" } : r));
  }

  function submitRequest() {
    if (!reqForm.name || !reqForm.email || !reqForm.title || !reqForm.date) return;
    saveR([...requests, { ...reqForm, id:`req-${Date.now()}`, status:"pending", createdAt:Date.now() }]);
    setReqDone(true);
    setReqForm(EMPTY_REQ);
  }

  const pubEvents = events
    .filter(e => e.published && isFuture(e.date))
    .filter(e => filterCat === "Tous" || e.categorie === filterCat)
    .sort((a,b) => {
      if (a.boosted && !b.boosted) return -1;
      if (!a.boosted && b.boosted) return 1;
      return a.date.localeCompare(b.date);
    });

  const pendingN = requests.filter(r => r.status === "pending").length;

  if (loading) return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:"#f9f4f0"}}>
      <div style={{width:40,height:40,border:"4px solid #eee",borderTopColor:R,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    </div>
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
          <button onClick={()=>setView("request")} style={{background:"rgba(255,255,255,.2)",border:"1.5px solid rgba(255,255,255,.5)",color:"#fff",padding:"7px 14px",borderRadius:5,cursor:"pointer",fontSize:".82rem",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>📩 Proposer</button>
          {isAdmin
            ? <button onClick={()=>setView("admin")} style={{background:"rgba(255,255,255,.2)",border:"1.5px solid rgba(255,255,255,.5)",color:"#fff",padding:"7px 14px",borderRadius:5,cursor:"pointer",fontSize:".82rem",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>⚙ Admin{pendingN>0?` (${pendingN})`:""}</button>
            : <button onClick={()=>setView("login")} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:".78rem",fontFamily:"Nunito,sans-serif"}}>Admin</button>
          }
        </nav>
      </div>
    </header>
  );

  const backB = (dest="agenda") => (
    <button onClick={()=>setView(dest)} style={{background:"none",border:"none",cursor:"pointer",color:R,fontSize:".9rem",padding:"0 0 20px",fontWeight:800,fontFamily:"Nunito,sans-serif",display:"block"}}>← Retour</button>
  );

  if (view === "agenda") return (
    <div style={{fontFamily:"Nunito,sans-serif",background:"#f9f4f0",minHeight:"100vh"}}>
      {hdr}
      <main style={{maxWidth:980,margin:"0 auto",padding:"0 20px 60px"}}>
        <div style={{textAlign:"center",padding:"48px 0 34px",borderBottom:"2px dashed #e8ded5",marginBottom:28}}>
          <Logo size={88}/>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(2.6rem,8vw,5rem)",color:R,margin:"12px 0 4px",letterSpacing:".05em",lineHeight:1}}>Sortir à Saint-Ouen</h1>
          <p style={{color:"#aaa",fontSize:".9rem",fontWeight:700,margin:0,letterSpacing:".12em",fontFamily:"Nunito,sans-serif"}}>#ONYVA · {pubEvents.length} événement{pubEvents.length!==1?"s":""} à venir</p>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:26}}>
          {["Tous",...CATEGORIES].map(c => (
            <button key={c} onClick={()=>setFilterCat(c)} style={{
              border:`1.5px solid ${filterCat===c?(c==="Tous"?"#1a1a1a":CAT_COL[c]):"#ddd"}`,
              background:filterCat===c?(c==="Tous"?"#1a1a1a":CAT_COL[c]):"#fff",
              color:filterCat===c?"#fff":"#666",padding:"5px 15px",borderRadius:20,
              cursor:"pointer",fontSize:".8rem",fontWeight:700,fontFamily:"Nunito,sans-serif",transition:"all .15s"
            }}>{c}</button>
          ))}
        </div>
        {pubEvents.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 0",color:"#bbb"}}>
            <div style={{fontSize:"3rem",marginBottom:12}}>📭</div>
            <p style={{fontWeight:700}}>Aucun événement pour l'instant.</p>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:20}}>
            {pubEvents.map((evt,i) => (
              <article key={evt.id} className={`ecard${evt.boosted?" boosted":""}`}
                style={{background:"#fff",border:"1.5px solid #ede7df",borderRadius:10,padding:20,cursor:"pointer",animationDelay:`${i*50}ms`}}
                onClick={()=>{setSelected(evt);setView("detail");}}>
                <div className="boost-label">⭐ À LA UNE</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{background:CAT_COL[evt.categorie]||R,color:"#fff",fontSize:".68rem",fontWeight:800,letterSpacing:".06em",padding:"3px 10px",borderRadius:4,textTransform:"uppercase"}}>{evt.categorie}</span>
                  <span style={{fontSize:".76rem",color:"#bbb",fontWeight:600}}>{fmtDate(evt.date)}</span>
                </div>
                <h2 style={{fontSize:"1.05rem",fontWeight:800,margin:"0 0 8px",lineHeight:1.3,color:"#1a1a1a"}}>{evt.title}</h2>
                <div style={{fontSize:".8rem",color:"#888",marginBottom:8,display:"flex",gap:10,flexWrap:"wrap"}}>
                  <span>📍 {evt.lieu}</span>{evt.time&&<span>🕐 {evt.time}</span>}
                </div>
                {evt.description && <p style={{fontSize:".82rem",color:"#999",lineHeight:1.5,margin:"0 0 12px"}}>{evt.description.length>85?evt.description.slice(0,85)+"…":evt.description}</p>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #f0ebe5",paddingTop:10}}>
                  <span style={{fontSize:".74rem",fontWeight:800,padding:"3px 10px",borderRadius:4,background:evt.gratuit?"#e8f5e9":"#fff3e0",color:evt.gratuit?"#2e7d32":"#e65100"}}>
                    {evt.gratuit?"Entrée libre":evt.prix||"Payant"}
                  </span>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <button className="like-btn" onClick={e=>toggleLike(evt.id,e)}>
                      {likedSet.has(evt.id)?"❤️":"🤍"} <span style={{fontSize:".72rem",color:"#bbb",fontWeight:700}}>{likes[evt.id]||0}</span>
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
    if (view === "detail" && selected) return (
    <div style={{fontFamily:"Nunito,sans-serif",background:"#f9f4f0",minHeight:"100vh"}}>
      {hdr}
      <main style={{maxWidth:980,margin:"0 auto",padding:"30px 20px 60px"}}>
        {backB()}
        <div style={{background:"#fff",border:"1.5px solid #ede7df",borderRadius:12,padding:32,maxWidth:640,margin:"0 auto"}}>
          {selected.boosted&&<div style={{background:"#fff3cd",color:"#c47d00",fontWeight:800,fontSize:".8rem",padding:"6px 14px",borderRadius:5,marginBottom:16,borderLeft:"3px solid #e67e22"}}>⭐ Événement mis à la une</div>}
          <span style={{background:CAT_COL[selected.categorie]||R,color:"#fff",fontSize:".75rem",fontWeight:800,letterSpacing:".06em",padding:"4px 12px",borderRadius:4,textTransform:"uppercase"}}>{selected.categorie}</span>
          <h1 style={{fontSize:"clamp(1.5rem,4vw,2.2rem)",fontWeight:800,margin:"14px 0 20px",lineHeight:1.2}}>{selected.title}</h1>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
            {[["📅 Date",fmtDate(selected.date)+(selected.time?` à ${selected.time}`:"")],
              ["📍 Lieu",selected.lieu,selected.adresse],
              ["💶 Tarif",selected.gratuit?"Entrée libre":selected.prix||"Payant"]].map(([l,v,s])=>(
              <div key={l} style={{display:"flex",flexDirection:"column",gap:2}}>
                <span style={{fontSize:".72rem",color:"#bbb",textTransform:"uppercase",letterSpacing:".05em",fontWeight:700}}>{l}</span>
                <span style={{fontWeight:800,fontSize:".95rem"}}>{v}</span>
                {s&&<span style={{fontSize:".8rem",color:"#aaa"}}>{s}</span>}
              </div>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              <span style={{fontSize:".72rem",color:"#bbb",textTransform:"uppercase",letterSpacing:".05em",fontWeight:700}}>❤️ J'aime</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button className="like-btn" style={{fontSize:"1.4rem"}} onClick={e=>toggleLike(selected.id,e)}>{likedSet.has(selected.id)?"❤️":"🤍"}</button>
                <span style={{fontWeight:800}}>{likes[selected.id]||0} like{(likes[selected.id]||0)!==1?"s":""}</span>
              </div>
            </div>
          </div>
          {selected.description&&<div style={{borderTop:"1px solid #f0ebe5",paddingTop:18,marginBottom:20}}><p style={{fontSize:".95rem",lineHeight:1.75,color:"#444",margin:0}}>{selected.description}</p></div>}
          {!selected.gratuit&&selected.helloasso&&(
            <div style={{marginBottom:16}}>
              <a className="ha-btn" href={selected.helloasso} target="_blank" rel="noopener noreferrer">🎟 Acheter des billets via HelloAsso →</a>
              <p style={{fontSize:".72rem",color:"#bbb",marginTop:5,fontWeight:600}}>Paiement sécurisé · Zéro commission pour l'organisateur</p>
            </div>
          )}
          {(selected.instagram||selected.facebook)&&(
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:8}}>
              {selected.instagram&&<a className="soc-btn" href={selected.instagram} target="_blank" rel="noopener noreferrer" style={{background:"linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",color:"#fff"}}>📸 Instagram</a>}
              {selected.facebook&&<a className="soc-btn" href={selected.facebook} target="_blank" rel="noopener noreferrer" style={{background:"#1877f2",color:"#fff"}}>👍 Facebook</a>}
            </div>
          )}
          {!selected.boosted&&!isAdmin&&(
            <div style={{background:"linear-gradient(135deg,#1a1a1a,#2a2a2a)",border:"1.5px solid #e67e22",borderRadius:10,padding:"18px 20px",marginTop:20}}>
              <div style={{color:"#F7A72A",fontWeight:800,fontSize:"1rem",marginBottom:4}}>⭐ Mettre cet événement à la une</div>
              <div style={{color:"#bbb",fontSize:".82rem",marginBottom:14}}>Votre événement apparaît en premier dans l'agenda. Service à {TARIF_BOOST}.</div>
              <a href={HELLOASSO_BOOST_URL} target="_blank" rel="noopener noreferrer"
                style={{display:"inline-flex",alignItems:"center",gap:8,background:"#e67e22",color:"#fff",padding:"10px 20px",borderRadius:6,fontWeight:800,fontSize:".88rem",textDecoration:"none",fontFamily:"Nunito,sans-serif"}}>
                ⭐ Mettre à la une — {TARIF_BOOST} via HelloAsso →
              </a>
            </div>
          )}
          {isAdmin&&(
            <div style={{marginTop:24,paddingTop:16,borderTop:"1px dashed #eee",display:"flex",gap:10,flexWrap:"wrap"}}>
              <button style={sbtn("#3498db")} onClick={()=>{setEvtForm({...selected});setEditId(selected.id);setATab("new");setView("admin");}}>✏️ Modifier</button>
              <button style={sbtn("#e67e22")} onClick={()=>setBoostMod(selected)}>{selected.boosted?"★ Retirer la une":"⭐ Mettre à la une"}</button>
              <button style={sbtn(R)} onClick={()=>setDelMod(selected)}>🗑 Supprimer</button>
            </div>
          )}
        </div>
      </main>
      <footer style={{background:R,color:"rgba(255,255,255,.8)",textAlign:"center",padding:"16px 20px",fontSize:".78rem",fontWeight:700,letterSpacing:".1em",fontFamily:"Nunito,sans-serif"}}>SORTIR À SAINT-OUEN · #ONYVA · 93400</footer>
    </div>
    if (view === "request") return (
    <div style={{fontFamily:"Nunito,sans-serif",background:"#f9f4f0",minHeight:"100vh"}}>
      {hdr}
      <main style={{maxWidth:980,margin:"0 auto",padding:"30px 20px 60px"}}>
        {backB()}
        <div style={{maxWidth:580,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <Logo size={64}/>
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2.2rem",color:R,margin:"10px 0 4px",letterSpacing:".05em"}}>Proposer un événement</h1>
          </div>
          <div style={{background:"#fff",border:"1.5px solid #ede7df",borderRadius:10,padding:"18px 20px",marginBottom:22}}>
            <div style={{fontWeight:800,fontSize:".95rem",marginBottom:12,color:"#333"}}>Comment ça marche ?</div>
            {[
              ["1️⃣","Remplissez ce formulaire","C'est gratuit et sans engagement."],
              ["2️⃣","Nous examinons votre demande","Si acceptée, vous recevrez un lien de paiement HelloAsso."],
              ["3️⃣",`Vous payez ${TARIF_PUBLICATION} via HelloAsso`,"Dès réception, votre événement est publié."],
            ].map(([n,t,d])=>(
              <div key={n} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontSize:"1.1rem",flexShrink:0}}>{n}</span>
                <div>
                  <div style={{fontWeight:800,fontSize:".88rem"}}>{t}</div>
                  <div style={{fontSize:".8rem",color:"#aaa"}}>{d}</div>
                </div>
              </div>
            ))}
          </div>
          {reqDone ? (
            <div style={{background:"#e8f5e9",border:"1px solid #a5d6a7",borderRadius:8,padding:28,textAlign:"center"}}>
              <div style={{fontSize:"2.5rem",marginBottom:8}}>✅</div>
              <p style={{fontWeight:800,color:"#2e7d32",margin:"0 0 8px"}}>Demande envoyée !</p>
              <p style={{color:"#555",fontSize:".9rem",margin:"0 0 18px"}}>Si acceptée, vous recevrez un lien HelloAsso ({TARIF_PUBLICATION}) à l'email indiqué.</p>
              <button style={{background:R,color:"#fff",border:"none",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontWeight:800,fontFamily:"Nunito,sans-serif"}} onClick={()=>setReqDone(false)}>Proposer un autre événement</button>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <Field label="Votre nom *"><input style={iStyle} value={reqForm.name} onChange={e=>setReqForm({...reqForm,name:e.target.value})} placeholder="Prénom Nom"/></Field>
                <Field label="Votre email *"><input style={iStyle} type="email" value={reqForm.email} onChange={e=>setReqForm({...reqForm,email:e.target.value})} placeholder="contact@email.fr"/></Field>
              </div>
              <Field label="Titre de l'événement *"><input style={iStyle} value={reqForm.title} onChange={e=>setReqForm({...reqForm,title:e.target.value})} placeholder="Ex : Soirée jazz au Canal…"/></Field>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <Field label="Date *"><input type="date" style={iStyle} value={reqForm.date} onChange={e=>setReqForm({...reqForm,date:e.target.value})}/></Field>
                <Field label="Heure"><input type="time" style={iStyle} value={reqForm.time} onChange={e=>setReqForm({...reqForm,time:e.target.value})}/></Field>
              </div>
              <Field label="Catégorie"><select style={iStyle} value={reqForm.categorie} onChange={e=>setReqForm({...reqForm,categorie:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
              <Field label="Lieu *"><input style={iStyle} value={reqForm.lieu} onChange={e=>setReqForm({...reqForm,lieu:e.target.value})} placeholder="Nom du lieu"/></Field>
              <Field label="Adresse"><input style={iStyle} value={reqForm.adresse} onChange={e=>setReqForm({...reqForm,adresse:e.target.value})} placeholder="Rue, Saint-Ouen"/></Field>
              <Field label="Description"><textarea style={{...iStyle,height:90,resize:"vertical"}} value={reqForm.description} onChange={e=>setReqForm({...reqForm,description:e.target.value})} placeholder="Décrivez votre événement…"/></Field>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <Field label="Entrée public (si payant)"><input style={iStyle} value={reqForm.prix} onChange={e=>setReqForm({...reqForm,prix:e.target.value})} placeholder="Ex : 8€ – vide si gratuit"/></Field>
                <Field label="Lien billetterie"><input style={iStyle} value={reqForm.helloasso} onChange={e=>setReqForm({...reqForm,helloasso:e.target.value})} placeholder="https://www.helloasso.com/…"/></Field>
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <Field label="Instagram"><input style={iStyle} value={reqForm.instagram} onChange={e=>setReqForm({...reqForm,instagram:e.target.value})} placeholder="https://instagram.com/…"/></Field>
                <Field label="Facebook"><input style={iStyle} value={reqForm.facebook} onChange={e=>setReqForm({...reqForm,facebook:e.target.value})} placeholder="https://facebook.com/…"/></Field>
              </div>
              <Field label="Message (optionnel)"><textarea style={{...iStyle,height:70,resize:"vertical"}} value={reqForm.message} onChange={e=>setReqForm({...reqForm,message:e.target.value})} placeholder="Informations complémentaires…"/></Field>
              <div style={{background:"linear-gradient(135deg,#1a1a1a,#2a2a2a)",border:"1.5px solid #e67e22",borderRadius:10,padding:"16px 18px"}}>
                <div style={{color:"#F7A72A",fontWeight:800,fontSize:".95rem",marginBottom:4}}>⭐ Option : Mettre à la une ({TARIF_BOOST})</div>
                <div style={{color:"#bbb",fontSize:".82rem",marginBottom:12}}>Votre événement en premier dans l'agenda avec un encadré doré.</div>
                <a href={HELLOASSO_BOOST_URL} target="_blank" rel="noopener noreferrer"
                  style={{display:"inline-flex",alignItems:"center",gap:8,background:"#e67e22",color:"#fff",padding:"9px 18px",borderRadius:6,fontWeight:800,fontSize:".85rem",textDecoration:"none",fontFamily:"Nunito,sans-serif"}}>
                  ⭐ Payer la mise à la une — {TARIF_BOOST} →
                </a>
              </div>
              <div style={{background:"#f9f4f0",border:"1px solid #e8e0d8",borderRadius:6,padding:"11px 14px",fontSize:".8rem",color:"#999"}}>
                📧 En soumettant, vous acceptez d'être contacté(e) avec un lien de paiement ({TARIF_PUBLICATION}) si votre demande est retenue.
              </div>
              <button style={{background:(!reqForm.name||!reqForm.email||!reqForm.title||!reqForm.date)?"#ccc":R,
                color:"#fff",border:"none",padding:"14px",fontSize:"1rem",fontWeight:800,borderRadius:6,
                cursor:(!reqForm.name||!reqForm.email||!reqForm.title||!reqForm.date)?"not-allowed":"pointer",
                fontFamily:"Nunito,sans-serif"}}
                onClick={submitRequest} disabled={!reqForm.name||!reqForm.email||!reqForm.title||!reqForm.date}>
                Envoyer ma demande (gratuit) →
              </button>
            </div>
          )}
        </div>
      </main>
      <footer style={{background:R,color:"rgba(255,255,255,.8)",textAlign:"center",padding:"16px 20px",fontSize:".78rem",fontWeight:700,letterSpacing:".1em",fontFamily:"Nunito,sans-serif"}}>SORTIR À SAINT-OUEN · #ONYVA · 93400</footer>
    </div>
    if (view === "login") return (
    <div style={{fontFamily:"Nunito,sans-serif",background:"#f9f4f0",minHeight:"100vh"}}>
      {hdr}
      <main style={{maxWidth:360,margin:"80px auto",padding:"0 20px"}}>
        <div style={{background:"#fff",border:"1.5px solid #ede7df",borderRadius:12,padding:32,textAlign:"center"}}>
          <Logo size={56}/>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.8rem",color:R,letterSpacing:".05em",margin:"12px 0 20px"}}>Accès Admin</h2>
          <input type="password" style={{...iStyle,textAlign:"center",letterSpacing:".2em",marginBottom:10}}
            placeholder="Mot de passe" value={pwInput}
            onChange={e=>setPwInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&login()}/>
          {pwError&&<p style={{color:R,fontSize:".85rem",fontWeight:700,margin:"0 0 10px"}}>Mot de passe incorrect.</p>}
          <button style={{background:R,color:"#fff",border:"none",padding:"12px",borderRadius:6,cursor:"pointer",fontWeight:800,fontSize:"1rem",fontFamily:"Nunito,sans-serif",width:"100%",marginBottom:10}} onClick={login}>Se connecter</button>
          <button style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",fontSize:".8rem",fontFamily:"Nunito,sans-serif"}} onClick={()=>setView("agenda")}>← Retour</button>
        </div>
      </main>
    </div>
    if (view === "admin" && isAdmin) return (
    <div style={{fontFamily:"Nunito,sans-serif",background:"#f9f4f0",minHeight:"100vh"}}>
      {hdr}
      <main style={{maxWidth:980,margin:"0 auto",padding:"30px 20px 60px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22,flexWrap:"wrap",gap:10}}>
          <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"2rem",color:R,margin:0,letterSpacing:".05em"}}>⚙ Administration</h1>
          <button style={{background:"none",border:"1px solid #ddd",color:"#888",padding:"6px 14px",borderRadius:5,cursor:"pointer",fontSize:".8rem",fontFamily:"Nunito,sans-serif"}} onClick={()=>{setIsAdmin(false);setView("agenda");}}>Déconnexion</button>
        </div>
        <div style={{display:"flex",gap:24,borderBottom:"2px solid #eee",marginBottom:24}}>
          {[["events","📅 Événements"],["requests",`📩 Demandes${pendingN>0?` (${pendingN})`:""}`],["new",editId?"✏️ Modifier":"➕ Créer"]].map(([k,l])=>(
            <button key={k} className={`atab${aTab===k?" on":""}`} onClick={()=>setATab(k)}>{l}</button>
          ))}
        </div>
        {aTab==="events"&&(
          <div>
            {events.length===0 ? <p style={{color:"#aaa"}}>Aucun événement.</p> : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[...events].sort((a,b)=>a.date.localeCompare(b.date)).map(evt=>(
                  <div key={evt.id} style={{background:"#fff",border:`1.5px solid ${evt.boosted?"#e67e22":"#ede7df"}`,borderRadius:8,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                    <div>
                      {evt.boosted&&<span style={{fontSize:".65rem",color:"#c47d00",fontWeight:800,marginRight:6}}>⭐</span>}
                      <span style={{fontWeight:800,fontSize:".95rem"}}>{evt.title}</span>
                      <span style={{color:"#bbb",fontSize:".8rem",marginLeft:10}}>{fmtDate(evt.date)}</span>
                      {!isFuture(evt.date)&&<span style={{color:R,fontSize:".7rem",fontWeight:700,marginLeft:8}}>PASSÉ</span>}
                      <div style={{fontSize:".78rem",color:"#aaa",marginTop:2}}>📍 {evt.lieu} · ❤️ {likes[evt.id]||0}</div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={sbtn("#3498db")} onClick={()=>{setEvtForm({...evt});setEditId(evt.id);setATab("new");}}>✏️</button>
                      <button style={sbtn("#e67e22")} onClick={()=>setBoostMod(evt)}>{evt.boosted?"★":"⭐"}</button>
                      <button style={sbtn(R)} onClick={()=>setDelMod(evt)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {aTab==="requests"&&(
          <div>
            {requests.length===0 ? <p style={{color:"#aaa"}}>Aucune demande reçue.</p> : (
              [...requests].sort((a,b)=>b.createdAt-a.createdAt).map(req=>(
                <div key={req.id} className={`req-card${req.status==="pending"?" pending":""}`}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
                        <span style={{fontSize:".7rem",fontWeight:800,padding:"2px 8px",borderRadius:3,
                          background:req.status==="pending"?"#fff3e0":req.status==="approved"?"#e8f5e9":"#fce4e4",
                          color:req.status==="pending"?"#e65100":req.status==="approved"?"#2e7d32":R}}>
                          {req.status==="pending"?"EN ATTENTE":req.status==="approved"?"✅ VALIDÉE":"REFUSÉE"}
                        </span>
                        <span style={{fontWeight:800,fontSize:".95rem"}}>{req.title}</span>
                      </div>
                      <div style={{fontSize:".8rem",color:"#555"}}>👤 {req.name} · 📧 <strong>{req.email}</strong></div>
                      <div style={{fontSize:".8rem",color:"#888"}}>📅 {fmtDate(req.date)} · 📍 {req.lieu}</div>
                      {req.description&&<p style={{fontSize:".82rem",color:"#666",margin:"6px 0 0"}}>{req.description}</p>}
                      {req.status==="approved"&&(
                        <div style={{background:"#e8f5e9",border:"1px solid #a5d6a7",borderRadius:6,padding:"12px 14px",marginTop:12}}>
                          <div style={{fontWeight:800,fontSize:".82rem",color:"#2e7d32",marginBottom:6}}>📧 Message à envoyer à {req.email} :</div>
                          <div style={{background:"#fff",border:"1px solid #c8e6c9",borderRadius:4,padding:"8px 12px",fontSize:".8rem",color:"#333",wordBreak:"break-all",marginBottom:8}}>
                            Bonjour {req.name}, votre événement «{req.title}» a été accepté ! Pour finaliser, merci de régler {TARIF_PUBLICATION} via : {HELLOASSO_PAYMENT_URL}
                          </div>
                          <button style={{...sbtn("#27ae60"),fontSize:".75rem"}}
                            onClick={()=>navigator.clipboard?.writeText(`Bonjour ${req.name}, votre événement «${req.title}» a été accepté sur Sortir à Saint-Ouen ! Pour finaliser la publication, merci de régler ${TARIF_PUBLICATION} via ce lien : ${HELLOASSO_PAYMENT_URL}`)}>
                            📋 Copier le message
                          </button>
                        </div>
                      )}
                    </div>
                    {req.status==="pending"&&(
                      <div style={{display:"flex",gap:8,flexShrink:0,flexDirection:"column"}}>
                        <button style={sbtn("#27ae60")} onClick={()=>approveRequest(req)}>✅ Valider</button>
                        <button style={sbtn(R)} onClick={()=>rejectRequest(req.id)}>✕ Refuser</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {aTab==="new"&&(
          <div style={{maxWidth:580}}>
            <h2 style={{fontWeight:800,margin:"0 0 20px",fontSize:"1.15rem"}}>{editId?"Modifier":"Créer un événement"}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <Field label="Titre *"><input style={iStyle} value={evtForm.title} onChange={e=>setEvtForm({...evtForm,title:e.target.value})} placeholder="Titre"/></Field>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <Field label="Date *"><input type="date" style={iStyle} value={evtForm.date} onChange={e=>setEvtForm({...evtForm,date:e.target.value})}/></Field>
                <Field label="Heure"><input type="time" style={iStyle} value={evtForm.time} onChange={e=>setEvtForm({...evtForm,time:e.target.value})}/></Field>
              </div>
              <Field label="Catégorie"><select style={iStyle} value={evtForm.categorie} onChange={e=>setEvtForm({...evtForm,categorie:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Field>
              <Field label="Lieu *"><input style={iStyle} value={evtForm.lieu} onChange={e=>setEvtForm({...evtForm,lieu:e.target.value})} placeholder="Nom du lieu"/></Field>
              <Field label="Adresse"><input style={iStyle} value={evtForm.adresse} onChange={e=>setEvtForm({...evtForm,adresse:e.target.value})} placeholder="Adresse complète"/></Field>
              <Field label="Description"><textarea style={{...iStyle,height:90,resize:"vertical"}} value={evtForm.description} onChange={e=>setEvtForm({...evtForm,description:e.target.value})}/></Field>
              <div style={{display:"flex",gap:20,fontWeight:700,fontSize:".9rem"}}>
                <label style={{cursor:"pointer",display:"flex",gap:6,alignItems:"center"}}><input type="radio" checked={evtForm.gratuit} onChange={()=>setEvtForm({...evtForm,gratuit:true})}/> Entrée libre</label>
                <label style={{cursor:"pointer",display:"flex",gap:6,alignItems:"center"}}><input type="radio" checked={!evtForm.gratuit} onChange={()=>setEvtForm({...evtForm,gratuit:false})}/> Payant</label>
              </div>
              {!evtForm.gratuit&&<Field label="Prix"><input style={iStyle} value={evtForm.prix} onChange={e=>setEvtForm({...evtForm,prix:e.target.value})} placeholder="Ex : 10€"/></Field>}
              {!evtForm.gratuit&&<Field label="🎟 HelloAsso"><input style={iStyle} value={evtForm.helloasso} onChange={e=>setEvtForm({...evtForm,helloasso:e.target.value})} placeholder="https://www.helloasso.com/…"/></Field>}
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <Field label="Instagram"><input style={iStyle} value={evtForm.instagram} onChange={e=>setEvtForm({...evtForm,instagram:e.target.value})} placeholder="https://instagram.com/…"/></Field>
                <Field label="Facebook"><input style={iStyle} value={evtForm.facebook} onChange={e=>setEvtForm({...evtForm,facebook:e.target.value})} placeholder="https://facebook.com/…"/></Field>
              </div>
              <div style={{background:"#fffdf5",border:"1px solid #ffe082",borderRadius:6,padding:"12px 16px"}}>
                <label style={{display:"flex",gap:10,cursor:"pointer",alignItems:"center"}}>
                  <input type="checkbox" checked={evtForm.boosted} onChange={e=>setEvtForm({...evtForm,boosted:e.target.checked})} style={{accentColor:"#e67e22"}}/>
                  <div>
                    <div style={{fontWeight:800,fontSize:".9rem"}}>⭐ Mettre à la une</div>
                    <div style={{fontSize:".78rem",color:"#aaa"}}>Apparaît en premier dans l'agenda.</div>
                  </div>
                </label>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={{background:(!evtForm.title||!evtForm.date||!evtForm.lieu)?"#ccc":R,color:"#fff",border:"none",padding:"13px 26px",fontSize:"1rem",fontWeight:800,borderRadius:6,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}
                  onClick={publishEvent} disabled={!evtForm.title||!evtForm.date||!evtForm.lieu}>
                  {editId?"Enregistrer":"Publier"} →
                </button>
                {editId&&<button style={{background:"none",border:"1px solid #ddd",color:"#888",padding:"13px 20px",borderRadius:6,cursor:"pointer",fontWeight:700,fontFamily:"Nunito,sans-serif"}}
                  onClick={()=>{setEditId(null);setEvtForm(EMPTY_EVT);}}>Annuler</button>}
              </div>
            </div>
          </div>
        )}
      </main>
      {boostMod&&<Modal onClose={()=>setBoostMod(null)}>
        <h2 style={{margin:"0 0 10px",fontSize:"1.2rem",fontWeight:800}}>{boostMod.boosted?"Retirer de la une":"⭐ Mettre à la une"}</h2>
        <p style={{color:"#555",fontSize:".9rem",margin:"0 0 20px"}}>«&nbsp;<strong>{boostMod.title}</strong>&nbsp;» {boostMod.boosted?"ne sera plus mis en avant.":"apparaîtra en premier avec un encadré doré."}</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button style={sbtn("#aaa")} onClick={()=>setBoostMod(null)}>Annuler</button>
          <button style={sbtn(boostMod.boosted?"#7f8c8d":"#e67e22")} onClick={()=>doBoost(boostMod.id)}>Confirmer</button>
        </div>
      </Modal>}
      {delMod&&<Modal onClose={()=>setDelMod(null)}>
        <h2 style={{margin:"0 0 10px",fontSize:"1.2rem",fontWeight:800,color:R}}>🗑 Supprimer</h2>
        <p style={{color:"#555",fontSize:".9rem",margin:"0 0 20px"}}>Supprimer «&nbsp;<strong>{delMod.title}</strong>&nbsp;» définitivement ?</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button style={sbtn("#aaa")} onClick={()=>setDelMod(null)}>Annuler</button>
          <button style={sbtn(R)} onClick={()=>deleteEvent(delMod.id)}>Supprimer</button>
        </div>
      </Modal>}
      <footer style={{background:R,color:"rgba(255,255,255,.8)",textAlign:"center",padding:"16px 20px",fontSize:".78rem",fontWeight:700,letterSpacing:".1em",fontFamily:"Nunito,sans-serif"}}>SORTIR À SAINT-OUEN · #ONYVA · 93400</footer>
    </div>
  );

  return null;
}
  );
  ;
  );
  );
  );

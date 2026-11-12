export const KEY = 'resq.rebuild.v2';
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const nowISO = () => new Date().toISOString();
export const fmtTime = t => new Date(t).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'});
export const fmtDate = t => new Date(t).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'});
export const cleanNumber = n => String(n || '').replace(/[^\d+]/g,'');
export const isValidNumber = n => /^\+?\d{3,15}$/.test(cleanNumber(n));
export const secondsLeft = (deadline, current=Date.now()) => Math.max(0,Math.ceil((deadline-current)/1000));
export function elapsedText(start,current=Date.now()){const s=Math.max(0,Math.floor((current-new Date(start).getTime())/1000));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
export const initials = n => {const p=String(n||'').trim().split(/\s+/).filter(Boolean);return p.length?(p[0][0]+(p[1]?.[0]||'')).toUpperCase():'ME';};
export const maskPolicy = n => n ? `•••• ${String(n).slice(-4)}` : '';
export const PRESETS = [
 {id:'resq',title:'Get ResQ',kicker:'Medical emergency',description:'Keep your location, MediCard and emergency updates together.',cta:'Get ResQ',icon:'heart'},
 {id:'reach',title:'Reach Me',kicker:'Bring help to you',description:'Prepare your location, describe the situation and add Video Stamps.',cta:'Start Reach Me',icon:'navigation'},
 {id:'ambulance',title:'Ambulance',kicker:'Saved helpline',description:'Open a call to your configured ambulance helpline.',cta:'Call ambulance',icon:'cross'},
 {id:'family',title:'Family emergency',kicker:'Your trusted circle',description:'Prepare an incident and call your primary family contact.',cta:'Contact family',icon:'users'}
];
export const SERVICES = [
 {id:'police',label:'Police',icon:'shield'}, {id:'fire',label:'Fire',icon:'flame'}, {id:'medical',label:'Medical',icon:'cross'}, {id:'disaster',label:'Disaster',icon:'alert'},
 {id:'women',label:'Women',icon:'user'}, {id:'child',label:'Child',icon:'child'}, {id:'elderly',label:'Elderly',icon:'elderly'}, {id:'bystander',label:'Report Bystander',icon:'report'}
];
export const NUMBER_LABELS = {ambulance:'Ambulance helpline',police:'Police',fire:'Fire',medical:'Medical',disaster:'Disaster',women:'Women support',child:'Child support',elderly:'Elderly support'};
// Non-emergency regional helplines must be verified and configured by the user.
export const DEFAULT_NUMBERS = {ambulance:'',police:'112',fire:'112',medical:'112',disaster:'112',women:'',child:'',elderly:''};
export function newProfile(relation='Self'){return {id:uid(),name:'',relation,age:'',gender:'',phone:'',blood:'',conditions:'',allergies:'',medicines:'',procedures:'',devices:'',needs:'',address:'',language:'English',doctor:'',insurer:'',policy:'',tpa:'',insuranceHelpline:'',hospitals:[],updatedAt:nowISO()};}
export function initialState(){const p=newProfile();return {version:2,ownerId:p.id,selectedId:p.id,profiles:[p],contacts:[],invites:[],history:[],active:null,numbers:{...DEFAULT_NUMBERS},prefs:{largeText:false,shareMedical:false}};}
export const OTHER_PATIENT = Object.freeze({id:'other',name:'Someone else',relation:'Not in your MediCards',age:'',conditions:'Unknown',allergies:'Unknown',medicines:'Unknown',unknown:true});
export function restoreState(raw){const base=initialState();if(!raw||raw.version!==2||!Array.isArray(raw.profiles))return base;const profiles=raw.profiles.filter(p=>p&&typeof p.id==='string').map(p=>({...newProfile(),...p,hospitals:Array.isArray(p.hospitals)?p.hospitals:[]}));if(!profiles.length)return base;const has=id=>profiles.some(p=>p.id===id);return {...base,profiles,ownerId:has(raw.ownerId)?raw.ownerId:profiles[0].id,selectedId:raw.selectedId==='other'||has(raw.selectedId)?raw.selectedId:profiles[0].id,contacts:Array.isArray(raw.contacts)?raw.contacts:[],invites:Array.isArray(raw.invites)?raw.invites:[],history:Array.isArray(raw.history)?raw.history:[],active:raw.active?.id&&raw.active.patient&&Array.isArray(raw.active.events)?{...raw.active,updates:raw.active.updates||[],stamps:raw.active.stamps||[]}:null,numbers:{...DEFAULT_NUMBERS,...raw.numbers},prefs:{...base.prefs,...raw.prefs}};}
export function loadState(){try{return restoreState(JSON.parse(localStorage.getItem(KEY)))}catch{return initialState()}}
export function saveState(db){try{localStorage.setItem(KEY,JSON.stringify(db));return true}catch{return false}}
export const ownerOf = db => db.profiles.find(p=>p.id===db.ownerId)||db.profiles[0];
export const selectedPatient = db => db.selectedId==='other'?OTHER_PATIENT:db.profiles.find(p=>p.id===db.selectedId)||ownerOf(db);
export const primaryContact = db => db.contacts.find(c=>c.primary&&isValidNumber(c.number))||db.contacts.find(c=>isValidNumber(c.number))||null;
export const bystanderPatient = obs => ({...OTHER_PATIENT,id:'bystander',name:'Unknown bystander',relation:'Bystander',age:obs?.ageGroup||'Unknown'});
export function placeText(loc){if(!loc)return 'Location not added';if(loc.address)return loc.address;if(Number.isFinite(loc.lat)&&Number.isFinite(loc.lng))return `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;return 'Location not added';}
export function addEvent(inc,title,detail=''){return {...inc,events:[...inc.events,{id:uid(),at:nowISO(),title,detail}]};}
export function createIncident(kind,patient,location,extra={}){const at=nowISO();const title=extra.title||({resq:'Get ResQ',reach:'Reach Me',family:'Family emergency',bystander:'Bystander SOS'}[kind])||'Emergency';return {id:uid(),ref:`RQ-${Math.random().toString(36).slice(2,6).toUpperCase()}`,kind,title,createdAt:at,status:'active',patient:{...patient},location:location?{...location}:null,alerts:{state:'not_connected'},callback:{state:'not_connected'},provider:{state:'not_connected',verified:false},dial:extra.dial||null,observations:extra.observations||null,updates:[],stamps:[],events:[{id:uid(),at,title:`${title} started`,detail:'Session saved on this device. No provider or contact has been notified automatically.'}]};}
export function operatorSummary(inc){const p=inc.patient||{};return [`Patient: ${p.name||'Name not given'}${p.age?`, ${p.age}`:''}`,`Location: ${placeText(inc.location)}`,inc.location?.accuracy?`GPS accuracy: ±${inc.location.accuracy} m`:'',inc.location?.landmark?`Landmark: ${inc.location.landmark}`:'',inc.observations?.note?`Observed: ${inc.observations.note}`:'',inc.observations?.conscious?`Conscious: ${inc.observations.conscious}`:'',inc.observations?.breathing?`Breathing: ${inc.observations.breathing}`:'',...inc.updates.map(u=>`${fmtTime(u.at)} — You reported: ${u.text}`),...(!p.unknown?[`Reported allergies: ${p.allergies||'Unknown'}`,`Reported conditions: ${p.conditions||'Unknown'}`,`Reported medicines: ${p.medicines||'Unknown'}`]:[]),`Started: ${fmtTime(inc.createdAt)} · ${inc.ref}`,'Medical information is self / family reported, not clinically verified.'].filter(Boolean).join('\n');}
export function circleMessage(inc,medical=false){return `ResQ ${inc.title}\nPatient: ${inc.patient.name||'Not named'}\nLocation: ${placeText(inc.location)}${inc.location?.lat!=null?`\nMap: https://<scrubbed-url-domain>?q=$%7Binc.location.lat%7D,$%7Binc.location.lng%7D%60:''}${medical&&!inc.patient.unknown?`\nAllergies: ${inc.patient.allergies||'Unknown'}\nConditions: ${inc.patient.conditions||'Unknown'}`:''}\nPlease contact me. No service is confirmed through ResQ.`;}
export function reachHeadline(provider){if(provider?.verified&&provider.state==='en_route')return 'Emergency services are reaching you';if(provider?.verified&&provider.state==='arrived')return 'Help has arrived';if(provider?.verified&&provider.state==='confirmed')return 'Service confirmed';return 'Your Reach Me incident is ready';}
export function osmEmbed(loc){if(!Number.isFinite(loc?.lat)||!Number.isFinite(loc?.lng))return null;const {lat,lng}=loc;return `https://<scrubbed-url-domain>/export/embed.html?bbox=$%7B[lng-.006,lat-.004,lng+.006,lat+.004].map(n=>n.toFixed(5)).join(',')}&layer=mapnik&marker=${lat.toFixed(5)},${lng.toFixed(5)}`;}

/* My Ihsan 0.37.0: Senaman 3D figure (Three.js r159 from hajj/three.min.js). Primitives only, no model files.
   A full, proportionate, modest and faceless figure: a man in a long-sleeved shirt, long trousers and shoes, with hair and a beard,
   or a woman in loose trousers, a long parka and a Malay-style hijab (tudung bawal draped over the chest). The face is a plain oval.
   The figure faces +z. Joints are groups; poses are set each frame from the move animations below, then the figure is put back
   on the floor (lowest probe at y=0) and its feet kept in place for standing moves.
   Fit3D.mount(box, {sex, col, move, sel, onPick, idle, yaw, props}) returns a controller {setMove, setSel, setSex, setYaw, pause, dispose}. */
window.Fit3D=(function(){
"use strict";
var T=THREE, PI=Math.PI;
// 0.40.0 (Farah): 10 colours for the top, trousers and hijab; the man can wear a white kopiah instead of showing his hair
// 0.5.22: index 9 of each list is white (the default outfit: white top, white trousers, white hijab or white kopiah)
var COAT=["#b5a58e","#8dabc1","#3a7ca5","#2e7d5b","#6b7d5c","#7a5c8e","#a3693c","#8c2f39","#2f3e46","#f1efe9"],
  PANTS=["#304d48","#303e54","#2b2f3a","#4a4a4a","#5b4636","#1f3b5c","#3d5a40","#6b5b73","#8a7a66","#e9e6df"],
  HIJ=["#e4d9c4","#d8a7a7","#c9b79c","#7f9db3","#2f3e46","#b5838d","#9aa88a","#e8b4bc","#5d5f99","#f2efe8"],
  SKIN=["#e6bf9b","#c89e79","#a77a55"];
function lam(c){ return new T.MeshLambertMaterial({color:new T.Color(c)}); }
function grp(x, y, z){ var g=new T.Group(); g.position.set(x||0, y||0, z||0); return g; }
// ---------- characters: procedural skinned "Modern Tunic" man and "Active Modest" woman (from Farah's My Ihsan Motion Studio, 0.40.0) ----------
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp;
function mkChar(gender, pal) {
  const female=gender==='female', palette=Object.assign({}, pal);
  const bones=[], byName={}, bind={};
  function bone(name,parent,position) {
    const b=new THREE.Bone();b.name=name;
    b.position.copy(position);
    if(parent){b.position.sub(bind[parent]);byName[parent].add(b);}
    byName[name]=b;bind[name]=position.clone();bones.push(b);return bones.length-1;
  }
  const ids={};
  ids.hip=bone('hip',null,V(0,.96,0));
  ids.spine=bone('spine','hip',V(0,1.17,0));
  ids.head=bone('head','spine',V(0,1.52,0));
  for(const [side,s] of [['L',1],['R',-1]]){
    ids['arm'+side]=bone('arm'+side,'spine',V(s*.245,1.445,0));
    ids['elbow'+side]=bone('elbow'+side,'arm'+side,V(s*.245,1.165,0));
    ids['hand'+side]=bone('hand'+side,'elbow'+side,V(s*.245,.90,0));
    ids['leg'+side]=bone('leg'+side,'hip',V(s*.115,.96,0));
    ids['knee'+side]=bone('knee'+side,'leg'+side,V(s*.115,.54,0));
    ids['foot'+side]=bone('foot'+side,'knee'+side,V(s*.115,.12,0));
  }
  const attributes={position:[],normal:[],color:[],skinIndex:[],skinWeight:[],region:[]};
  const colourKeys=[],drapeIndices=[];
  function weights(entries){
    const a=[0,0,0,0],w=[0,0,0,0];let total=0;
    entries.slice(0,4).forEach(([name,value],i)=>{a[i]=ids[name];w[i]=Math.max(0,value);total+=w[i];});
    return [a,w.map(n=>n/(total||1))];
  }
  const fixed=name=>()=>weights([[name,1]]);
  function bodyWeight(p){
    if(p.y>1.16)return weights([['spine',1]]);
    if(p.y>.94){const t=clamp((p.y-.94)/.22,0,1);return weights([['spine',t],['hip',1-t]]);}
    // Lower garment follows the thighs without exposing the body beneath it.
    return weights([['hip',1]]);
  }
  function limbWeight(side,type,p){
    const arm=type==='arm',mid=arm?1.165:.54,span=arm?.07:.09;
    const top=(arm?'arm':'leg')+side,low=(arm?'elbow':'knee')+side;
    const t=clamp((p.y-(mid-span))/(span*2),0,1);
    return weights([[top,t],[low,1-t]]);
  }
  function bodyRegion(p){
    if(p.y>1.40&&Math.abs(p.x)>.14)return 2;
    if(p.z<0)return p.y>.98?5:6;
    if(p.y>1.24)return 3;
    if(p.y>.96)return 4;
    return p.x>=0?9:10;
  }
  /** Sample a shaped surface, then flatten only region IDs, retaining smooth normals. */
  function surface(nu,nv,sample,key,weight,region) {
    const verts=[],index=[];
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=sample(i/nu,j/nv);verts.push(p.x,p.y,p.z);}
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;
      index.push(a,c,b,b,c,d);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(index);g.computeVertexNormals();
    const raw=g.toNonIndexed(),pos=raw.attributes.position,normal=raw.attributes.normal;
    const color=new THREE.Color(palette[key]);
    for(let i=0;i<pos.count;i+=3){
      const center=V();for(let k=0;k<3;k++)center.add(V().fromBufferAttribute(pos,i+k));center.multiplyScalar(1/3);
      const rid=typeof region==='function'?region(center):region;
      for(let k=0;k<3;k++){
        const p=V().fromBufferAttribute(pos,i+k),[bi,bw]=weight(p);
        if(weight===bodyWeight&&p.y<1.15)drapeIndices.push(attributes.position.length/3);
        attributes.position.push(p.x,p.y,p.z);attributes.normal.push(normal.getX(i+k),normal.getY(i+k),normal.getZ(i+k));
        attributes.color.push(color.r,color.g,color.b);attributes.skinIndex.push(...bi);attributes.skinWeight.push(...bw);attributes.region.push(rid);colourKeys.push(key);
      }
    }
    raw.dispose();g.dispose();
  }
  function ellipsoid(center,scale,key,weight,region,nu=20,nv=12,thetaStart=0,thetaLength=Math.PI){
    surface(nu,nv,(u,v)=>{const a=u*Math.PI*2,t=thetaStart+v*thetaLength;return V(center.x+scale.x*Math.sin(t)*Math.sin(a),center.y+scale.y*Math.cos(t),center.z+scale.z*Math.sin(t)*Math.cos(a));},key,weight,region);
  }
  function loft(rings,cx,key,weight,region,segments=24){
    // Densely sample a smooth profile. Slight broad folds add shape without textures.
    const points=rings.map(r=>V(r[1],r[0],r[2]));
    const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
    surface(segments,(rings.length-1)*3,(u,v)=>{
      const p=curve.getPoint(v),a=u*Math.PI*2;
      const fold=1+.012*Math.cos(a*6)*Math.sin(v*Math.PI);
      return V(cx+p.x*Math.sin(a)*fold,p.y,p.z*Math.cos(a)*fold);
    },key,weight,region);
  }

  // Tunic/parka: a single continuous shell with distributed skinning.
  const hem=female?.62:.70;
  loft([[1.515,.074,.072],[1.475,.173,.10],[1.43,.235,.13],[1.30,.218,.14],[1.13,.225,.151],[.97,.245,.17],[.82,.27,.178],[hem,.285,.18]],0,'coat',bodyWeight,bodyRegion);
  if(!female){ // stand collar
    loft([[1.55,.074,.073],[1.51,.077,.075]],0,'coat',fixed('spine'),3,20);
    ellipsoid(V(0,1.55,0),V(.059,.08,.058),'skin',fixed('head'),1,16,8);
  }
  for(const [side,s] of [['L',1],['R',-1]]){
    const x=s*.245, armId=s===1?7:8;
    loft([[1.465,.012,.025],[1.44,.071,.081],[1.36,.078,.083],[1.20,.068,.071],[1.15,.065,.071],[1.04,.059,.061],[.91,.051,.054]],x,'coat',p=>limbWeight(side,'arm',p),p=>p.y>1.37?2:armId,18);
    // Hand is a soft palm + thumb, not an oval bead. Fingers are intentionally grouped.
    ellipsoid(V(x,.849,.007),V(.036,.073,.024),'skin',fixed('hand'+side),13,16,10);
    ellipsoid(V(x-s*.032,.862,.018),V(.017,.038,.018),'skin',fixed('hand'+side),13,12,8);
    const lx=s*.115;
    loft([[1.00,.10,.102],[.88,.105,.109],[.70,.094,.099],[.55,.088,.091],[.47,.087,.090],[.30,.084,.087],[.115,.083,.084]],lx,'pants',p=>limbWeight(side,'leg',p),p=>p.y>.55?(s===1?9:10):(s===1?11:12),18);
    // Closed, rounded shoes with a distinct low sole.
    ellipsoid(V(lx,.067,.049),V(.09,.065,.158),'shoe',fixed('foot'+side),14,20,10);
    ellipsoid(V(lx,.025,.049),V(.091,.025,.159),'sole',fixed('foot'+side),14,20,8);
  }
  // Blank faces and head coverings have non-intersecting, explicit apertures.
  if(female){
    surface(32,16,(u,v)=>{
      const a=u*2*Math.PI,t=v*Math.PI/2;
      return V(.0825*Math.sin(t)*Math.cos(a),1.687+.1085*Math.sin(t)*Math.sin(a),.087+.035*Math.cos(t));
    },'skin',fixed('head'),1);
    surface(32,20,(u,v)=>{
      const a=u*2*Math.PI,t=.80+v*(Math.PI-.80);
      return V(.115*Math.sin(t)*Math.cos(a),1.687+.151*Math.sin(t)*Math.sin(a),.009+.112*Math.cos(t));
    },'scarf',fixed('head'),1);
    // Broad drape sits outside the coat, with a gently pointed front/back hem.
    const drape=new THREE.CatmullRomCurve3([
      V(.090,1.61,.105),V(.120,1.54,.134),V(.265,1.46,.169),
      V(.302,1.38,.185),V(.251,1.29,.181)
    ]);
    surface(32,20,(u,v)=>{
      const a=u*2*Math.PI,p=drape.getPoint(v),front=Math.cos(a);
      const fold=1+.016*Math.cos(3*a+v*5)*Math.sin(v*Math.PI);
      return V(p.x*Math.sin(a)*fold,p.y-.055*Math.abs(front)*v*v,p.z*front*fold);
    },'scarf',p=>weights([['head',clamp((p.y-1.48)/.13,0,1)],['spine',1-clamp((p.y-1.48)/.13,0,1)]]),p=>p.y>1.53?1:bodyRegion(p));
  }else{
    ellipsoid(V(0,1.681,.005),V(.093,.133,.085),'skin',fixed('head'),1,28,18);
    // One continuous scalp surface with a higher front and lower back hairline.
    surface(32,16,(u,v)=>{
      const a=u*2*Math.PI,t=v*(1.65-.55*Math.cos(a));
      return V(.098*Math.sin(t)*Math.sin(a),1.69+.137*Math.cos(t),-.006+.094*Math.sin(t)*Math.cos(a));
    },'hair',fixed('head'),1);
    surface(24,8,(u,v)=>{
      const a=(u-.5)*Math.PI*1.22,t=v;
      const x=.092*Math.sin(a)*(1-.12*t);
      const y=1.631-.066*t+.022*Math.abs(Math.sin(a));
      return V(x,y,.078*Math.cos(a)+.008);
    },'hair',fixed('head'),1);
    for(const s of [-1,1])ellipsoid(V(s*.092,1.676,0),V(.014,.027,.015),'skin',fixed('head'),1,12,8);
  }
  const geometry=new THREE.BufferGeometry();
  for(const [name,size] of [['position',3],['normal',3],['color',3],['skinIndex',4],['skinWeight',4],['region',1]]){
    geometry.setAttribute(name,name==='skinIndex'?new THREE.Uint16BufferAttribute(attributes[name],size):new THREE.Float32BufferAttribute(attributes[name],size));
  }
  const basePositions=geometry.attributes.position.array.slice();
  const selR={value:new Array(15).fill(0)}, pulse={value:0};
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,metalness:0,side:THREE.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.uniforms.selR=selR; shader.uniforms.pulse=pulse;
    shader.vertexShader='attribute float region; uniform float selR[15]; varying float vSel;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSel = 0.0; for(int ri=0; ri<15; ri++){ if(abs(region-float(ri))<0.1) vSel=selR[ri]; }');
    shader.fragmentShader='uniform float pulse; varying float vSel;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(vSel>0.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86,0.6,0.16), 0.55+0.3*pulse);');
  };
  material.customProgramCacheKey=()=> 'ibadah-fit-regions-v1';
  const mesh=new THREE.SkinnedMesh(geometry,material);mesh.name=gender+'-character';
  mesh.add(byName.hip);mesh.bind(new THREE.Skeleton(bones));mesh.frustumCulled=false;
  // A conservative sphere covers every supported pose; prevents stale bind-pose raycast bounds.
  mesh.boundingSphere=new THREE.Sphere(V(0,.9,0),3);
  mesh.boundingBox=new THREE.Box3(V(-3,-2,-3),V(3,4,3));
  const character={gender,mesh,bones:byName,ids,palette,triangles:geometry.attributes.position.count/3,
    selR:selR, pulse:pulse,
    deformGarment(left,right){
      const attr=geometry.attributes.position;
      // A lightweight corrective drape instead of a cloth simulation. The
      // closed outer garment expands over the raised thigh, keeping one hem.
      for(const i of drapeIndices){
        const x=basePositions[i*3],y=basePositions[i*3+1],z=basePositions[i*3+2];
        const side=clamp((x+.18)/.36,0,1),lift=left*side+right*(1-side);
        const falloff=clamp((1.15-y)/.28,0,1),front=clamp((z+.02)/.17,0,1);
        attr.setXYZ(i,x,y,z+.51*lift*falloff*front);
      }
      attr.needsUpdate=true;
    },
    setColor(key,hex){palette[key]=hex;const c=new THREE.Color(hex),attr=geometry.attributes.color;for(let i=0;i<colourKeys.length;i++)if(colourKeys[i]===key)attr.setXYZ(i,c.r,c.g,c.b);attr.needsUpdate=true;},
    dispose(){geometry.dispose();material.dispose();mesh.skeleton.dispose();},
    reset(){for(const b of bones)b.rotation.set(0,0,0);byName.hip.position.copy(bind.hip);},
  };
  return character;
}

// regions of the character mesh -> the app's body parts
var REG2P={1:"all",2:"bahu",3:"dada",4:"perut",5:"belakang",6:"punggung",7:"lengan",8:"lengan",9:"paha",10:"paha",11:"betis",12:"betis",13:"lengan",14:"betis"};
var P2REG={lengan:[7,8,13],bahu:[2],dada:[3],perut:[4],belakang:[5],punggung:[6],paha:[9,10],betis:[11,12,14]};
function palOf(sex, c){ var fem=sex==="f"; c=c||{};
  return {coat:COAT[c.top!=null?c.top:9]||COAT[9], pants:PANTS[c.pants!=null?c.pants:9]||PANTS[9], scarf:HIJ[c.hj!=null?c.hj:9]||HIJ[9], skin:SKIN[c.sk==null?1:c.sk]||SKIN[1],
    hair:"#302923", shoe:fem?"#c2b9a8":"#a89d89", sole:fem?"#e7e1d6":"#e0dbce"}; }
function buildFigure(sex, col){
  var fem=sex==="f", ch=mkChar(fem?"female":"male", palOf(sex,col)), b=ch.bones, spin=grp(); spin.add(ch.mesh);
  var J={spin:spin, root:b.hip, spine:b.spine, neck:b.head}, probes=[];
  ["L","R"].forEach(function(s){ J["sh"+s]=b["arm"+s]; J["el"+s]=b["elbow"+s]; J["hp"+s]=b["leg"+s]; J["kn"+s]=b["knee"+s]; J["an"+s]=b["foot"+s];
    var pt=grp(0,-0.1,0.2), pm=grp(0,-0.12,0.05), ph=grp(0,-0.1,-0.09); b["foot"+s].add(pt); b["foot"+s].add(pm); b["foot"+s].add(ph); probes.push(pt,pm,ph); J["heel"+s]=ph;
    var hd=grp(0,-0.13,0.01); b["hand"+s].add(hd); probes.push(hd); var el=grp(); b["elbow"+s].add(el); probes.push(el); var kp=grp(0,0,0.09); b["knee"+s].add(kp); probes.push(kp); });
  var tp=grp(0,0.31,0); b.head.add(tp); probes.push(tp);
  // white kopiah (knitted skullcap) for the man, on the crown over the hair
  var cap=null;
  if(!fem){ cap=grp(); var cm=new T.MeshStandardMaterial({color:0xf4f2ec, roughness:.95});
    var band=new T.Mesh(new T.CylinderGeometry(0.099,0.104,0.085,32,1,true), cm); band.position.set(0,0.262,-0.004); cap.add(band);
    var top=new T.Mesh(new T.SphereGeometry(0.099,32,10,0,Math.PI*2,0,Math.PI/2), cm); top.scale.set(1,0.28,1); top.position.set(0,0.303,-0.004); cap.add(top);
    var rib=new T.Mesh(new T.TorusGeometry(0.103,0.005,6,40), new T.MeshStandardMaterial({color:0xe4e0d6, roughness:1})); rib.rotation.x=Math.PI/2; rib.position.set(0,0.225,-0.004); cap.add(rib);
    cap.scale.set(1,1,0.97); cap.visible=!!(col&&col.cap); b.head.add(cap); }
  var F={spin:spin, J:J, probes:probes, fem:fem, ch:ch, cap:cap, hipY:0.96, rest:null};
  apply(F, P0()); F.rest={}; ground(F, P0(), true);
  ["L","R"].forEach(function(s){ var v=new T.Vector3().setFromMatrixPosition(J["heel"+s].matrixWorld); spin.worldToLocal(v); F.rest[s]={x:v.x, z:v.z}; });
  return F;
}

// ---------- poses ----------
function P0(){ return {x:0,y:0,z:0,rx:0,ry:0,rz:0,spX:0,spY:0,spZ:0,nk:0,
  shLf:0,shLo:0.1,shLt:0,shLh:0,elL:0.15, shRf:0,shRo:0.1,shRt:0,shRh:0,elR:0.15,
  hpLf:0,hpLo:0.02,knL:0,anL:0, hpRf:0,hpRo:0.02,knR:0,anR:0, anc:"both", lift:0}; }
function pos(v){ return v>0?v:0; }
function sm(t){ return t*t*(3-2*t); }
// keyframes: list of partial poses, looped over ph (0..1)
function kf(ph, list, P){ var n=list.length, t=ph*n, i=Math.floor(t)%n, f=sm(t-Math.floor(t)), a=list[i], b=list[(i+1)%n], k;
  var keys={}; for(k in a) keys[k]=1; for(k in b) keys[k]=1; var d=P0();
  for(k in keys){ var va=a[k]!==undefined?a[k]:d[k], vb=b[k]!==undefined?b[k]:d[k]; if(typeof va==="number") P[k]=va+(vb-va)*f; else P[k]=f<0.5?va:vb; } }
// one side for the first half of the cycle, the other for the second: returns [side, q 0..1..0]
function alt(ph){ var s=ph<0.5?"L":"R", l=(ph*2)%1; return [s, Math.sin(PI*l), l]; }
function O(s){ return s==="L"?"R":"L"; }
function guard(P){ P.shLf=1.05; P.shRf=1.05; P.elL=2.2; P.elR=2.2; P.shLo=0.25; P.shRo=0.25; P.knL=0.25; P.knR=0.25; P.hpLf=0.12; P.hpRf=0.12; }
function behindHead(P,s){ P["sh"+s+"o"]=1.45; P["sh"+s+"t"]=1.57; P["el"+s]=2.5; P["sh"+s+"f"]=0.25; }
function onHips(P,s){ P["sh"+s+"o"]=0.5; P["sh"+s+"t"]=-1.2; P["el"+s]=1.7; P["sh"+s+"f"]=-0.2; }
function plank(P, rx){ P.rx=rx; P.shLf=rx; P.shRf=rx; P.shLo=0.08; P.shRo=0.08; P.elL=0; P.elR=0; P.anc="none"; P.nk=-0.5; P.anL=0.6; P.anR=0.6; }
function squatP(P,d){ P.hpLf=1.45*d; P.hpRf=1.45*d; P.knL=1.95*d; P.knR=1.95*d; P.anL=-0.45*d; P.anR=-0.45*d; P.spX=0.5*d; P.hpLo=0.12; P.hpRo=0.12; }
function lungeP(P,s,d){ var o=O(s); P["hp"+s+"f"]=1.35*d; P["kn"+s]=1.35*d; P["hp"+o+"f"]=-0.38*d; P["kn"+o]=1.05*d; P["an"+o]=0.5*d; P["an"+s]=-0.1*d; P.anc=s; }
var A={
  idle:function(ph,P){ var S=Math.sin(2*PI*ph); P.spX=0.015*S; P.shLo=0.12+0.02*S; P.shRo=0.12+0.02*S; P.nk=0.01*S; },
  march:function(ph,P,k){ var S=Math.sin(2*PI*ph), a=k||0.95; P.hpLf=a*pos(S); P.knL=1.55*pos(S); P.hpRf=a*pos(-S); P.knR=1.55*pos(-S); P.anL=0.35*pos(S); P.anR=0.35*pos(-S);
    P.shLf=-0.5*S; P.shRf=0.5*S; P.elL=1.2; P.elR=1.2; P.anc=S>0?"R":"L"; },
  jog:function(ph,P){ var S=Math.sin(2*PI*ph); P.hpLf=0.55*pos(S); P.knL=1.3*pos(S)+0.5*pos(-S); P.hpRf=0.55*pos(-S); P.knR=1.3*pos(-S)+0.5*pos(S); P.anL=0.4*pos(S); P.anR=0.4*pos(-S);
    P.shLf=-0.7*S; P.shRf=0.7*S; P.elL=1.6; P.elR=1.6; P.spX=0.08; P.lift=0.04*Math.abs(S); P.anc=S>0?"R":"L"; },
  highknee:function(ph,P){ A.march(ph,P,1.45); var S=Math.sin(2*PI*ph); P.knL=1.85*pos(S); P.knR=1.85*pos(-S); P.shLf=-0.9*S; P.shRf=0.9*S; P.elL=1.5; P.elR=1.5; P.lift=0.05*Math.abs(S); },
  sprint:function(ph,P){ A.highknee(ph,P); var S=Math.sin(2*PI*ph); P.spX=0.16; P.shLf=-1.2*S; P.shRf=1.2*S; },
  buttkick:function(ph,P){ var S=Math.sin(2*PI*ph); P.knL=2.25*pos(S); P.knR=2.25*pos(-S); P.hpLf=-0.1*pos(S); P.hpRf=-0.1*pos(-S); P.anL=0.5*pos(S); P.anR=0.5*pos(-S);
    P.shLf=-0.6*S; P.shRf=0.6*S; P.elL=1.6; P.elR=1.6; P.lift=0.04*Math.abs(S); P.spX=0.06; P.anc=S>0?"R":"L"; },
  stepjack:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; P["hp"+s+"o"]=0.02+0.42*q; P.shLo=0.12+2.6*q; P.shRo=0.12+2.6*q; P.elL=0.2; P.elR=0.2; P.knL=0.15*q; P.knR=0.15*q; P.anc=O(s); },
  jack:function(ph,P){ var C=Math.cos(2*PI*ph), o=(1-C)/2; P.shLo=0.15+2.8*o; P.shRo=0.15+2.8*o; P.hpLo=0.04+0.33*o; P.hpRo=0.04+0.33*o; P.elL=0.15; P.elR=0.15; P.lift=0.07*Math.abs(Math.sin(2*PI*ph)); P.knL=0.1; P.knR=0.1; P.anc="none"; },
  starjump:function(ph,P){ kf(ph,[{hpLf:0.75,hpRf:0.75,knL:1.3,knR:1.3,anL:-0.35,anR:-0.35,spX:0.4,shLf:0.4,shRf:0.4,anc:"both"},{shLo:2.5,shRo:2.5,hpLo:0.5,hpRo:0.5,lift:0.3,anL:0.4,anR:0.4,elL:0,elR:0,anc:"none"},{hpLf:0.6,hpRf:0.6,knL:1.0,knR:1.0,anL:-0.3,anR:-0.3,spX:0.3,anc:"both"},{}],P); },
  sidestep:function(ph,P,clap){ var w=2*PI*ph, o=0.22*(0.5+0.5*Math.cos(2*w)); P.x=0.28*Math.sin(w); P.hpLo=0.03+o; P.hpRo=0.03+o; P.knL=0.25; P.knR=0.25; P.hpLf=0.12; P.hpRf=0.12;
    if(clap){ var u=0.5-0.5*Math.cos(2*w); P.shLo=0.3+2.65*u; P.shRo=0.3+2.65*u; P.elL=0.25; P.elR=0.25; } else { P.shLf=0.7+0.2*Math.sin(2*w); P.shRf=0.7+0.2*Math.sin(2*w); P.elL=1.4; P.elR=1.4; } P.anc="none"; },
  sideclap:function(ph,P){ A.sidestep(ph,P,true); },
  heeltap:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); P["hp"+s+"f"]=0.45*q; P["an"+s]=-0.6*q; P["kn"+o]=0.35*q; P["hp"+o+"f"]=0.25*q; P.shLf=1.1*q; P.shRf=1.1*q; P.elL=0.3; P.elR=0.3; P.anc=o; },
  toetap:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; P["hp"+s+"f"]=0.8*q; P["kn"+s]=1.05*q; P["an"+s]=0.15*q; var S=s==="L"?q:-q; P.shLf=-0.5*S; P.shRf=0.5*S; P.elL=1.3; P.elR=1.3; P.anc=O(s); },
  calfraise:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; P.anL=0.55*d; P.anR=0.55*d; P.shLo=0.25; P.shRo=0.25; P.shLf=0.2; P.shRf=0.2; P.anc="none"; },
  squat:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; squatP(P,d); P.shLf=1.5*d; P.shRf=1.5*d; P.elL=0.1; P.elR=0.1; },
  chairsquat:function(ph,P){ var d=0.82*(1-Math.cos(2*PI*ph))/2; squatP(P,d); P.shLf=1.4*d; P.shRf=1.4*d; P.elL=0.15; P.elR=0.15; },
  squatpunch:function(ph,P){ if(ph<0.5){ A.squat(ph*2,P); return; } var a=alt((ph-0.5)*2), s=a[0], q=a[1]; guard(P); P["sh"+s+"f"]=1.05+0.5*q; P["el"+s]=2.2*(1-q); P.spY=(s==="L"?-0.3:0.3)*q; },
  squatjump:function(ph,P){ kf(ph,[{},{hpLf:1.4,hpRf:1.4,knL:1.9,knR:1.9,anL:-0.45,anR:-0.45,spX:0.5,shLf:-0.5,shRf:-0.5,hpLo:0.12,hpRo:0.12},{lift:0.32,shLf:2.6,shRf:2.6,anL:0.5,anR:0.5,anc:"none"},{hpLf:0.9,hpRf:0.9,knL:1.2,knR:1.2,anL:-0.3,anR:-0.3,spX:0.35,shLf:0.5,shRf:0.5}],P); },
  lunge:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; lungeP(P,s,q); onHips(P,"L"); onHips(P,"R"); },
  lungetwist:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; lungeP(P,s,q); P.spY=(s==="L"?0.55:-0.55)*q; P.shLf=1.45; P.shRf=1.45; P.elL=0.15; P.elR=0.15; P.shLh=0.2; P.shRh=0.2; },
  lungejump:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; lungeP(P,s,Math.min(1,q*1.15)); P.lift=0.22*Math.pow(1-q,2); var S=s==="L"?1:-1; P.shLf=-0.8*S; P.shRf=0.8*S; P.elL=1.4; P.elR=1.4; },
  skater:function(ph,P){ var w=2*PI*ph, e=Math.cos(w), a=pos(e), b=pos(-e); P.x=0.36*Math.tanh(2.2*e); P.lift=0.08*Math.abs(Math.sin(w)); P.spX=0.5;
    P.hpLf=0.6*a-0.35*b; P.knL=0.75*a+0.9*b; P.hpLo=0.02-0.3*b; P.hpRf=0.6*b-0.35*a; P.knR=0.75*b+0.9*a; P.hpRo=0.02-0.3*a;
    P.shLf=-0.6*a+1.0*b; P.shRf=-0.6*b+1.0*a; P.shLh=0.6*b; P.shRh=0.6*a; P.elL=0.3; P.elR=0.3; P.anc=e>0?"L":"R"; },
  lathop:function(ph,P){ var w=2*PI*ph; P.x=0.2*Math.tanh(3*Math.cos(w)); P.lift=0.12*Math.abs(Math.sin(w)); var k=0.35+0.35*(1-Math.abs(Math.sin(w))); P.knL=k; P.knR=k; P.hpLf=k*0.6; P.hpRf=k*0.6; P.anL=-0.2; P.anR=-0.2; P.shLf=0.5; P.shRf=0.5; P.elL=1.3; P.elR=1.3; P.spX=0.15; P.anc="none"; },
  rope:function(ph,P){ var w=2*PI*ph, S=Math.sin(w); P.lift=0.05*Math.abs(S); P.anL=0.3*Math.abs(S); P.anR=0.3*Math.abs(S); P.shLo=0.4; P.shRo=0.4; P.shLf=0.25+0.12*Math.cos(2*w); P.shRf=0.25+0.12*Math.cos(2*w); P.elL=0.8; P.elR=0.8; P.knL=0.1; P.knR=0.1; P.anc="none"; },
  tuckjump:function(ph,P){ kf(ph,[{},{hpLf:1.0,hpRf:1.0,knL:1.4,knR:1.4,anL:-0.35,anR:-0.35,spX:0.4,shLf:-0.4,shRf:-0.4},{lift:0.36,hpLf:1.7,hpRf:1.7,knL:2.1,knR:2.1,shLf:1.4,shRf:1.4,elL:0.6,elR:0.6,anc:"none"},{hpLf:0.8,hpRf:0.8,knL:1.1,knR:1.1,anL:-0.3,anR:-0.3,spX:0.3}],P); },
  frontkick:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; guard(P); P["hp"+s+"f"]=1.35*q; P["kn"+s]=0.1+1.5*Math.sin(PI*Math.min(1,q))*(q<0.98?1:0.2); P["an"+s]=-0.2*q; P.spX=-0.05*q; P.anc=O(s); },
  sidekick:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; guard(P); P["hp"+s+"o"]=1.0*q; P["kn"+s]=0.1+1.3*Math.sin(PI*q)*0.6; P.spZ=(s==="L"?0.4:-0.4)*q; P.anc=O(s); },
  kickback:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; P.spX=0.35; P["hp"+s+"f"]=-0.85*q; P["kn"+s]=0.25; P["hp"+O(s)+"f"]=0.25; P["kn"+O(s)]=0.25; onHips(P,"L"); onHips(P,"R"); P.anc=O(s); },
  kneeelbow:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); behindHead(P,"L"); behindHead(P,"R"); P["hp"+s+"f"]=1.4*q; P["kn"+s]=1.6*q; P["hp"+s+"o"]=0.02-0.15*q;
    P.spX=0.35*q; P.spY=(s==="L"?0.45:-0.45)*q; P.spZ=(s==="L"?-0.15:0.15)*q; P.anc=o; },
  kneedrive:function(ph,P){ var q=Math.sin(PI*((ph*2)%1)), s=ph<0.5?"L":"R"; P.shLf=2.8*(1-q)+0.6*q; P.shRf=2.8*(1-q)+0.6*q; P.elL=1.6*q; P.elR=1.6*q; P["hp"+s+"f"]=1.4*q; P["kn"+s]=1.6*q; P.spX=0.3*q; P.anc=O(s); },
  punch:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; guard(P); P["sh"+s+"f"]=1.05+0.5*q; P["el"+s]=2.2*(1-q); P["sh"+s+"h"]=0.15*q; P.spY=(s==="L"?-0.3:0.3)*q; },
  uppercut:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; guard(P); P["sh"+s+"f"]=0.5+1.7*q; P["el"+s]=1.6; P.knL=0.3+0.2*(1-q); P.knR=P.knL; P.spY=(s==="L"?-0.35:0.35)*q; },
  ohpunch:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); P["sh"+s+"f"]=1.3+1.65*q; P["el"+s]=2.4*(1-q); P["sh"+s+"o"]=0.3; P["sh"+o+"f"]=1.3; P["el"+o]=2.4; P["sh"+o+"o"]=0.3; P.knL=0.2; P.knR=0.2; },
  boxshuffle:function(ph,P){ var w=2*PI*ph, S=Math.sin(w); guard(P); P.lift=0.035*Math.abs(Math.sin(2*w)); P.hpLf=0.15+0.2*S; P.hpRf=0.15-0.2*S; var s=S>0?"L":"R", q=Math.abs(S); P["sh"+s+"f"]=1.05+0.5*q; P["el"+s]=2.2*(1-q); P.spY=(s==="L"?-0.25:0.25)*q; P.anc="none"; },
  armcircle:function(ph,P){ var w=2*PI*ph; P.shLo=1.5+0.25*Math.cos(w); P.shRo=1.5+0.25*Math.cos(w); P.shLf=0.3*Math.sin(w); P.shRf=0.3*Math.sin(w); P.elL=0.05; P.elR=0.05; },
  swim:function(ph,P){ var w=2*PI*ph; P.shLf=w; P.shRf=w+PI; P.shLo=0.2; P.shRo=0.2; P.elL=0.2; P.elR=0.2; P.spY=0.2*Math.sin(w); P.knL=0.15; P.knR=0.15; },
  pulldown:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; P.shLo=2.85-1.45*d; P.shRo=2.85-1.45*d; P.shLt=1.57*d; P.shRt=1.57*d; P.elL=1.9*d; P.elR=1.9*d; P.spX=-0.05*d; },
  fly:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; P.shLo=1.45; P.shRo=1.45; P.shLh=1.35*d; P.shRh=1.35*d; P.shLt=-1.57; P.shRt=-1.57; P.elL=0.45; P.elR=0.45; },
  wallpush:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2, rx=0.42; P.rx=rx; P.shLf=PI/2+rx-0.15-0.55*d; P.shRf=P.shLf; P.elL=1.6*d; P.elR=1.6*d; P.shLo=0.3+0.4*d; P.shRo=P.shLo; P.anL=-0.35; P.anR=-0.35; P.anc="both"; },
  kneepush:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2, rx=Math.acos(Math.max(0.1,Math.min(0.95,(0.6-0.27*d)/1.02))); plank(P,rx); P.knL=1.7; P.knR=1.7; P.anL=0.3; P.anR=0.3; P.shLf=rx-0.9*d; P.shRf=P.shLf; P.elL=1.7*d; P.elR=1.7*d; P.shLo=0.25+0.3*d; P.shRo=P.shLo; },
  pushup:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2, rx=Math.acos(Math.max(0.1,Math.min(0.95,(0.6-0.27*d)/1.5))); plank(P,rx); P.shLf=rx-0.9*d; P.shRf=P.shLf; P.elL=1.7*d; P.elR=1.7*d; P.shLo=0.25+0.3*d; P.shRo=P.shLo; },
  twist:function(ph,P){ var S=Math.sin(2*PI*ph); P.spY=0.6*S; P.ry=-0.1*S; P.shLf=1.35; P.shRf=1.35; P.shLt=-1.57; P.shRt=-1.57; P.elL=1.7; P.elR=1.7; P.shLo=0.3; P.shRo=0.3; P.knL=0.15; P.knR=0.15; },
  sidebend:function(ph,P){ var S=Math.sin(2*PI*ph); P.spZ=0.45*S; P.shLo=0.1+2.6*pos(S); P.shRo=0.1+2.6*pos(-S); P.elL=0.3*pos(S); P.elR=0.3*pos(-S); P.hpLo=0.12; P.hpRo=0.12; },
  windmill:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; P.hpLo=0.3; P.hpRo=0.3; P.shLo=1.5; P.shRo=1.5; P.elL=0; P.elR=0; P.spX=1.15*q; P.spY=(s==="L"?-0.8:0.8)*q; P.knL=0.15; P.knR=0.15; },
  hipcircle:function(ph,P){ var w=2*PI*ph; onHips(P,"L"); onHips(P,"R"); P.x=0.07*Math.cos(w); P.z=0.07*Math.sin(w); P.rz=-0.1*Math.cos(w); P.rx=0.1*Math.sin(w); P.spZ=0.18*Math.cos(w); P.spX=-0.12*Math.sin(w); P.hpLo=0.1; P.hpRo=0.1; },
  hinge:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; behindHead(P,"L"); behindHead(P,"R"); P.rx=0.95*d; P.hpLf=0.95*d; P.hpRf=0.95*d; P.knL=0.2*d; P.knR=0.2*d; P.nk=-0.3*d; },
  inchworm:function(ph,P){ var fold={rx:0.9,hpLf:0.9,hpRf:0.9,spX:0.6,shLf:1.0,shRf:1.0,elL:0,elR:0,nk:-0.3,anc:"both"}, pl={rx:1.16,shLf:1.16,shRf:1.16,elL:0,elR:0,nk:-0.5,anL:0.6,anR:0.6,anc:"none"};
    kf(ph,[{},fold,pl,pl,fold],P); },
  climber:function(ph,P){ var S=Math.sin(2*PI*ph); plank(P,1.16); P.hpLf=1.35*pos(S); P.knL=1.75*pos(S); P.hpRf=1.35*pos(-S); P.knR=1.75*pos(-S); P.anL=0.6-0.3*pos(S); P.anR=0.6-0.3*pos(-S); },
  plankjack:function(ph,P){ var o=(1-Math.cos(2*PI*ph))/2; plank(P,1.16); P.hpLo=0.03+0.35*o; P.hpRo=0.03+0.35*o; P.lift=0.04*Math.abs(Math.sin(2*PI*ph)); },
  shtap:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; plank(P,1.16); P["sh"+s+"f"]=1.16+0.25*q; P["el"+s]=2.3*q; P["sh"+s+"h"]=0.75*q; P.hpLo=0.18; P.hpRo=0.18; P.rz=(s==="L"?0.05:-0.05)*q; },
  burpee:function(ph,P){ var sq={hpLf:1.6,hpRf:1.6,knL:2.1,knR:2.1,anL:-0.5,anR:-0.5,spX:0.75,shLf:0.75,shRf:0.75,elL:0,elR:0,hpLo:0.12,hpRo:0.12}, pl={rx:1.16,shLf:1.16,shRf:1.16,elL:0,elR:0,nk:-0.5,anL:0.6,anR:0.6,anc:"none"};
    kf(ph,[{},sq,pl,sq,{lift:0.22,shLf:2.9,shRf:2.9,elL:0,elR:0,anL:0.5,anR:0.5,anc:"none"}],P); },
  breath:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; P.shLo=0.15+2.7*d; P.shRo=0.15+2.7*d; P.elL=0.1; P.elR=0.1; P.nk=-0.15*d; },
  sidestretch:function(ph,P){ var S=Math.sin(2*PI*ph); P.spZ=0.4*S; P.shLo=0.15+2.6*pos(S); P.shRo=0.15+2.6*pos(-S); P.elL=0.4*pos(S); P.elR=0.4*pos(-S); },
  quad:function(ph,P){ var a=alt(ph), s=a[0], q=sm(Math.min(1,a[1]*1.6)); P["kn"+s]=2.5*q; P["hp"+s+"f"]=-0.15*q; P["sh"+s+"f"]=-0.55*q; P["el"+s]=0.2; P["sh"+O(s)+"o"]=0.35; P.anc=O(s); },
  armx:function(ph,P){ var a=alt(ph), s=a[0], q=sm(Math.min(1,a[1]*1.6)); P["sh"+s+"f"]=1.45*q; P["sh"+s+"h"]=1.0*q; P["el"+s]=0.1; P["sh"+O(s)+"f"]=1.2*q; P["el"+O(s)]=1.9*q; P["sh"+O(s)+"h"]=0.6*q; },
  // ---- 0.2.0: animations for the 40 new moves ----
  latraise:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; P.shLo=0.12+1.45*d; P.shRo=0.12+1.45*d; P.elL=0.12; P.elR=0.12; P.knL=0.08; P.knR=0.08; },
  frontraise:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; P.shLf=1.55*d; P.shRf=1.55*d; P.elL=0.1; P.elR=0.1; P.shLo=0.1; P.shRo=0.1; },
  curl:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; P.shLf=0.12; P.shRf=0.12; P["el"+s]=2.6*q; P.knL=0.08; P.knR=0.08; },
  legraise:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; onHips(P,"L"); onHips(P,"R"); P["hp"+s+"o"]=0.02+0.75*q; P.spZ=(s==="L"?0.12:-0.12)*q; P.anc=O(s); },
  sumo:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; squatP(P,0.85*d); P.hpLo=0.4; P.hpRo=0.4; P.shLf=1.0*d; P.shRf=1.0*d; P.elL=0.1+1.5*d; P.elR=0.1+1.5*d; P.shLh=0.5*d; P.shRh=0.5*d; P.anc="none"; },
  curtsy:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); lungeP(P,s,q); P["hp"+o+"o"]=0.02-0.38*q; P.shLf=1.3*q; P.shRf=1.3*q; P.elL=0.1+1.6*q; P.elR=0.1+1.6*q; P.shLh=0.6*q; P.shRh=0.6*q; },
  pulsesquat:function(ph,P){ var d=0.8+0.2*(1-Math.cos(4*PI*ph))/2; squatP(P,d); P.shLf=1.5; P.shRf=1.5; P.elL=0.1; P.elR=0.1; },
  sidelunge:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); P["hp"+s+"f"]=0.9*q; P["kn"+s]=1.5*q; P["an"+s]=-0.3*q; P["hp"+s+"o"]=0.3*q; P["hp"+o+"o"]=0.3*q; P["kn"+o]=0.05; P.spX=0.4*q; P.shLf=1.35*q; P.shRf=1.35*q; P.elL=0.1+1.5*q; P.elR=0.1+1.5*q; P.shLh=0.5*q; P.shRh=0.5*q; P.anc="both"; },
  crossjack:function(ph,P){ var C=Math.cos(2*PI*ph), o=(1-C)/2; P.hpLo=0.04+0.33*o; P.hpRo=0.04+0.33*o; P.shLo=0.1+2.3*o; P.shRo=0.1+2.3*o; P.shLf=1.35*(1-o); P.shRf=1.35*(1-o); P.shLh=0.9*(1-o); P.shRh=0.9*(1-o); P.elL=0.2+0.6*(1-o); P.elR=0.2+0.6*(1-o); P.lift=0.07*Math.abs(Math.sin(2*PI*ph)); P.knL=0.1; P.knR=0.1; P.anc="none"; },
  jabcross:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; guard(P); P["sh"+s+"f"]=1.05+0.5*q; P["el"+s]=2.2*(1-q); P["sh"+s+"h"]=0.2*q; P.spY=(s==="L"?-0.5:0.5)*q; P.ry=(s==="L"?0.12:-0.12)*q; P["kn"+O(s)]=0.35*q+0.25; P["an"+O(s)]=0.2*q; },
  hookpunch:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; guard(P); P["sh"+s+"f"]=1.4; P["sh"+s+"o"]=0.4; P["el"+s]=1.6; P["sh"+s+"h"]=-0.8+1.5*q; P.spY=(s==="L"?-0.6:0.6)*q; P.ry=(s==="L"?0.1:-0.1)*q; },
  standcrunch:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); behindHead(P,"L"); behindHead(P,"R"); P["hp"+s+"o"]=0.7*q; P["hp"+s+"f"]=0.9*q; P["kn"+s]=1.7*q; P.spZ=(s==="L"?0.3:-0.3)*q; P.spX=0.2*q; P.anc=o; },
  skihop:function(ph,P){ var w=2*PI*ph; P.x=0.2*Math.tanh(3*Math.cos(w)); P.lift=0.12*Math.abs(Math.sin(w)); var k=0.35+0.3*(1-Math.abs(Math.sin(w))); P.knL=k; P.knR=k; P.hpLf=k*0.6; P.hpRf=k*0.6; P.anL=-0.2; P.anR=-0.2; P.spX=0.25;
    var sw=0.55+0.475*Math.sin(2*w+PI/2); P.shLf=sw; P.shRf=sw; P.elL=0.5; P.elR=0.5; P.shLo=0.15; P.shRo=0.15; P.anc="none"; },
  squattouch:function(ph,P){ var d=(1-Math.cos(2*PI*ph))/2; squatP(P,d); P.spX=0.85*d; P.shLf=2.7*(1-d)+0.35*d; P.shRf=P.shLf; P.elL=0.1; P.elR=0.1; P.hpLo=0.2*d; P.hpRo=0.2*d; },
  reachlunge:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; lungeP(P,s,q); P.shLf=0.3+2.6*q; P.shRf=P.shLf; P.shLo=0.2; P.shRo=0.2; P.elL=0.1; P.elR=0.1; P.spX=-0.12*q; },
  lungekick:function(ph,P){ var a=alt(ph), s=a[0], l=a[2], o=O(s); guard(P);
    if(l<0.5){ var dl=Math.sin(PI*l*2); lungeP(P,s,dl); P.shLf=1.05; P.shRf=1.05; P.elL=2.2; P.elR=2.2; }
    else { var kq=Math.sin(PI*(l-0.5)*2); P["hp"+o+"f"]=1.35*kq; P["kn"+o]=0.1+0.3*(1-kq); P["hp"+s+"f"]=0.1; P["kn"+s]=0.15; P.spX=-0.05*kq; P.anc=s; } },
  fastfeet:function(ph,P){ var S=Math.sin(2*PI*ph); P.spX=0.3; P.hpLf=0.5+0.35*pos(S); P.knL=0.8+0.6*pos(S); P.hpRf=0.5+0.35*pos(-S); P.knR=0.8+0.6*pos(-S); P.anL=0.35*pos(S); P.anR=0.35*pos(-S); P.shLf=0.9-0.5*S; P.shRf=0.9+0.5*S; P.elL=1.6; P.elR=1.6; P.lift=0.03*Math.abs(S); P.anc="none"; },
  kneeraiseside:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; onHips(P,"L"); onHips(P,"R"); P["hp"+s+"o"]=0.8*q; P["hp"+s+"f"]=0.55*q; P["kn"+s]=1.6*q; P.spZ=(s==="L"?-0.1:0.1)*q; P.anc=O(s); },
  twistjack:function(ph,P){ var C=Math.cos(2*PI*ph), o=(1-C)/2, S=Math.sin(2*PI*ph); P.hpLo=0.04+0.33*o; P.hpRo=0.04+0.33*o; P.shLf=1.4; P.shRf=1.4; P.shLh=0.5; P.shRh=0.5; P.elL=1.7; P.elR=1.7; P.spY=0.55*S; P.lift=0.07*Math.abs(S); P.knL=0.1; P.knR=0.1; P.anc="none"; },
  frogjump:function(ph,P){ var sq={hpLf:1.5,hpRf:1.5,knL:2.15,knR:2.15,anL:-0.5,anR:-0.5,spX:0.75,hpLo:0.38,hpRo:0.38,shLf:0.35,shRf:0.35,elL:0,elR:0,anc:"both"}; kf(ph,[{},sq,{lift:0.3,hpLf:0.7,hpRf:0.7,knL:1.1,knR:1.1,anL:0.5,anR:0.5,hpLo:0.3,hpRo:0.3,shLf:2.6,shRf:2.6,anc:"none"},sq],P); },
  sumojump:function(ph,P){ var sq={hpLf:1.2,hpRf:1.2,knL:1.8,knR:1.8,anL:-0.4,anR:-0.4,spX:0.45,hpLo:0.42,hpRo:0.42,shLf:1.1,shRf:1.1,elL:1.6,elR:1.6,shLh:0.5,shRh:0.5,anc:"both"}; kf(ph,[{hpLo:0.35,hpRo:0.35},sq,{lift:0.32,hpLo:0.3,hpRo:0.3,anL:0.5,anR:0.5,shLf:1.1,shRf:1.1,elL:1.6,elR:1.6,anc:"none"},sq],P); },
  plyoskater:function(ph,P){ A.skater(ph,P); var w=2*PI*ph; P.x=P.x*1.3; P.lift=0.22*Math.pow(Math.abs(Math.sin(w)),0.8); P.spX=0.6; },
  squatstar:function(ph,P){ var sq={hpLf:1.55,hpRf:1.55,knL:2.1,knR:2.1,anL:-0.5,anR:-0.5,spX:0.6,hpLo:0.15,hpRo:0.15,shLf:1.1,shRf:1.1,elL:2.4,elR:2.4,anc:"both"}; kf(ph,[{},sq,{lift:0.34,shLo:2.5,shRo:2.5,hpLo:0.5,hpRo:0.5,anL:0.4,anR:0.4,elL:0,elR:0,anc:"none"},sq],P); },
  burpeepush:function(ph,P){ var sq={hpLf:1.6,hpRf:1.6,knL:2.1,knR:2.1,anL:-0.5,anR:-0.5,spX:0.75,shLf:0.75,shRf:0.75,elL:0,elR:0,hpLo:0.12,hpRo:0.12}, pl={rx:1.16,shLf:1.16,shRf:1.16,elL:0,elR:0,nk:-0.5,anL:0.6,anR:0.6,anc:"none"}, dn={rx:1.33,shLf:0.45,shRf:0.45,elL:1.7,elR:1.7,shLo:0.55,shRo:0.55,nk:-0.5,anL:0.6,anR:0.6,anc:"none"};
    kf(ph,[{},sq,pl,dn,pl,sq,{lift:0.22,shLf:2.9,shRf:2.9,elL:0,elR:0,anL:0.5,anR:0.5,anc:"none"}],P); },
  burpeetuck:function(ph,P){ var sq={hpLf:1.6,hpRf:1.6,knL:2.1,knR:2.1,anL:-0.5,anR:-0.5,spX:0.75,shLf:0.75,shRf:0.75,elL:0,elR:0,hpLo:0.12,hpRo:0.12}, pl={rx:1.16,shLf:1.16,shRf:1.16,elL:0,elR:0,nk:-0.5,anL:0.6,anR:0.6,anc:"none"};
    kf(ph,[{},sq,pl,sq,{lift:0.36,hpLf:1.7,hpRf:1.7,knL:2.1,knR:2.1,shLf:1.4,shRf:1.4,elL:0.6,elR:0.6,anc:"none"}],P); },
  climbercross:function(ph,P){ var S=Math.sin(2*PI*ph); plank(P,1.16); P.hpLf=1.3*pos(S); P.knL=1.75*pos(S); P.hpLo=-0.35*pos(S); P.hpRf=1.3*pos(-S); P.knR=1.75*pos(-S); P.hpRo=-0.35*pos(-S); P.spY=0.25*S; P.anL=0.6-0.3*pos(S); P.anR=0.6-0.3*pos(-S); },
  spiderman:function(ph,P){ var a=alt(ph), s=a[0], q=a[1]; plank(P,1.16); P["hp"+s+"f"]=1.3*q; P["kn"+s]=1.8*q; P["hp"+s+"o"]=0.02+0.75*q; P.hpLo=Math.max(P.hpLo,0.18); P.hpRo=Math.max(P.hpRo,0.18); P.rx=1.16-0.1*q; P["an"+s]=0.3; P.rz=(s==="L"?0.05:-0.05)*q; },
  pushuptap:function(ph,P){ if(ph<0.5){ A.pushup(ph*2,P); return; } var a=alt((ph-0.5)*2), s=a[0], q=a[1]; plank(P,1.16); P["sh"+s+"f"]=1.16+0.25*q; P["el"+s]=2.3*q; P["sh"+s+"h"]=0.75*q; P.hpLo=0.18; P.hpRo=0.18; },
  spinjump:function(ph,P){ var h=ph<0.5, t=(ph%0.5)*2, u=Math.sin(PI*t), b=Math.pow(1-u,1.5); P.ry=h?PI*sm(t):PI*(1-sm(t)); P.lift=0.3*u*u; P.hpLf=0.55*b+0.1; P.hpRf=P.hpLf; P.knL=1.0*b+0.1; P.knR=P.knL; P.anL=-0.3*b+0.4*u; P.anR=P.anL; P.spX=0.35*b; P.shLf=0.4+0.9*u; P.shRf=P.shLf; P.shLo=0.4; P.shRo=0.4; P.elL=1.2; P.elR=1.2; if(u>0.35) P.anc="none"; },
  sprawl:function(ph,P){ var sq={hpLf:1.6,hpRf:1.6,knL:2.1,knR:2.1,anL:-0.5,anR:-0.5,spX:0.75,shLf:0.75,shRf:0.75,elL:0,elR:0,hpLo:0.12,hpRo:0.12}, pl={rx:1.16,shLf:1.16,shRf:1.16,elL:0,elR:0,nk:-0.5,anL:0.6,anR:0.6,anc:"none"};
    kf(ph,[{},sq,pl,pl,sq],P); },
  squatkick:function(ph,P){ if(ph<0.5){ A.squat(ph*2,P); return; } var a=alt((ph-0.5)*2), s=a[0], q=a[1]; guard(P); P["hp"+s+"o"]=1.0*q; P["kn"+s]=0.1+0.8*Math.sin(PI*q); P.spZ=(s==="L"?0.4:-0.4)*q; P.anc=O(s); },
  hikneepunch:function(ph,P){ A.highknee(ph,P); var S=Math.sin(2*PI*ph), s=S>0?"R":"L", q=Math.abs(S); P.shLf=1.0; P.shRf=1.0; P.elL=2.1; P.elR=2.1; P["sh"+s+"f"]=1.0+0.6*q; P["el"+s]=2.1*(1-q); P.spY=(s==="L"?-0.25:0.25)*q; },
  cossack:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); P["hp"+s+"f"]=1.5*q; P["kn"+s]=2.2*q; P["an"+s]=-0.5*q; P["hp"+s+"o"]=0.45+0.25*q; P["hp"+o+"o"]=0.45+0.25*q; P["kn"+o]=0.05; P["an"+o]=-0.6*q; P.spX=0.45*q; P.shLf=1.35*q; P.shRf=1.35*q; P.elL=0.1+1.5*q; P.elR=0.1+1.5*q; P.shLh=0.5*q; P.shRh=0.5*q; P.x=(s==="L"?-0.18:0.18)*q; P.anc="both"; },
  rdl1:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); P.rx=1.3*q; P["hp"+s+"f"]=1.3*q; P["kn"+s]=0.15*q; P["hp"+o+"f"]=0.3*q; P["kn"+o]=0.05; P.shLf=1.3*q; P.shRf=1.3*q; P.elL=0.15; P.elR=0.15; P.nk=-0.4*q; P.anc=s; },
  pistol:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s); P["hp"+s+"f"]=1.65*q; P["kn"+s]=2.25*q; P["an"+s]=-0.55*q; P["hp"+o+"f"]=1.55*q; P["kn"+o]=0.05; P.spX=0.5*q; P.shLf=1.5*q; P.shRf=1.5*q; P.elL=0.1; P.elR=0.1; P.anc=s; },
  lungepunch:function(ph,P){ A.lungejump(ph,P); var a=alt(ph), s=a[0], q=a[1], o=O(s); P["sh"+o+"f"]=1.05+0.5*q; P["el"+o]=2.2*(1-q); P["sh"+s+"f"]=1.05; P["el"+s]=2.2; P["sh"+o+"h"]=0.15*q; P.spY=(o==="L"?-0.3:0.3)*q; },
  sealjack:function(ph,P){ var C=Math.cos(2*PI*ph), o=(1-C)/2; P.hpLo=0.04+0.33*o; P.hpRo=0.04+0.33*o; P.shLo=0.1+1.4*o; P.shRo=0.1+1.4*o; P.shLf=1.5*(1-o); P.shRf=1.5*(1-o); P.shLh=0.35*(1-o); P.shRh=0.35*(1-o); P.elL=0.15; P.elR=0.15; P.lift=0.07*Math.abs(Math.sin(2*PI*ph)); P.knL=0.1; P.knR=0.1; P.anc="none"; },
  powerskip:function(ph,P){ A.highknee(ph,P); var S=Math.sin(2*PI*ph); P.lift=0.16*Math.abs(S)+0.04; P.shLf=-1.3*S; P.shRf=1.3*S; P.elL=1.5; P.elR=1.5; P.spX=0.1; P.anc="none"; },
  bearcrawl:function(ph,P){ var a=alt(ph), s=a[0], q=a[1], o=O(s), rx=1.32; P.rx=rx; P.shLf=rx; P.shRf=rx; P.shLo=0.1; P.shRo=0.1; P.elL=0; P.elR=0; P.nk=-0.55; P.anc="none";
    P.hpLf=rx; P.hpRf=rx; P.knL=1.55; P.knR=1.55; P.anL=0.5; P.anR=0.5; P["hp"+s+"f"]=rx+0.5*q; P["kn"+s]=1.55+0.4*q; P["sh"+o+"f"]=rx+0.28*q; P["sh"+s+"f"]=rx-0.1*q; P.hpLo=0.12; P.hpRo=0.12; },
  jacksquat:function(ph,P){ if(ph<0.5) A.jack(ph*2,P); else A.squat((ph-0.5)*2,P); }

};
// cycles a second at level 2 (the player scales by the level tempo)
var SPEED={idle:0.25,march:0.9,jog:1.35,highknee:1.45,sprint:2,buttkick:1.45,stepjack:0.55,jack:0.95,starjump:0.5,sidestep:0.45,sideclap:0.45,heeltap:0.75,toetap:1.0,calfraise:0.55,squat:0.42,chairsquat:0.3,
  squatpunch:0.35,squatjump:0.45,lunge:0.38,lungetwist:0.33,lungejump:0.5,skater:0.6,lathop:0.85,rope:2,tuckjump:0.5,frontkick:0.55,sidekick:0.55,kickback:0.6,kneeelbow:0.6,kneedrive:0.9,punch:1.3,uppercut:1.1,
  ohpunch:1.1,boxshuffle:1.6,armcircle:0.8,swim:0.6,pulldown:0.55,fly:0.5,wallpush:0.42,kneepush:0.38,pushup:0.4,twist:0.6,sidebend:0.45,windmill:0.45,hipcircle:0.45,hinge:0.38,inchworm:0.16,climber:1.3,
  plankjack:0.9,shtap:0.7,burpee:0.3,breath:0.18,sidestretch:0.15,quad:0.12,armx:0.12,
  latraise:0.45,frontraise:0.45,curl:0.4,legraise:0.45,sumo:0.4,curtsy:0.38,pulsesquat:0.45,sidelunge:0.38,crossjack:0.95,jabcross:1.2,hookpunch:1.0,standcrunch:0.55,skihop:0.85,squattouch:0.42,reachlunge:0.38,lungekick:0.32,
  fastfeet:2.2,kneeraiseside:0.55,twistjack:0.9,frogjump:0.4,sumojump:0.45,plyoskater:0.55,squatstar:0.42,burpeepush:0.25,burpeetuck:0.28,climbercross:1.2,spiderman:0.55,pushuptap:0.3,spinjump:0.32,sprawl:0.32,squatkick:0.28,
  hikneepunch:1.4,cossack:0.35,rdl1:0.32,pistol:0.3,lungepunch:0.5,sealjack:0.95,powerskip:0.9,bearcrawl:0.5,jacksquat:0.4};
var FLOOR={pushup:1,kneepush:1,climber:1,plankjack:1,shtap:1,inchworm:1,burpee:1,burpeepush:1,burpeetuck:1,climbercross:1,spiderman:1,pushuptap:1,sprawl:1,bearcrawl:1};

var _e=new T.Euler(0,0,0,"XZY"), _q1=new T.Quaternion(), _q2=new T.Quaternion(), _Y=new T.Vector3(0,1,0);
function apply(F, P){ var J=F.J;
  J.root.rotation.set(P.rx, P.ry, P.rz); J.spine.rotation.set(P.spX, P.spY, P.spZ); J.neck.rotation.set(P.nk,0,0);
  ["L","R"].forEach(function(s){ var m=s==="L"?1:-1;
    _e.set(-P["sh"+s+"f"], m*P["sh"+s+"t"], m*P["sh"+s+"o"], "XZY"); _q1.setFromEuler(_e); _q2.setFromAxisAngle(_Y, -m*P["sh"+s+"h"]); J["sh"+s].quaternion.copy(_q2).multiply(_q1);
    J["el"+s].rotation.set(-P["el"+s],0,0);
    J["hp"+s].rotation.set(-P["hp"+s+"f"], 0, m*P["hp"+s+"o"]);
    J["kn"+s].rotation.set(P["kn"+s],0,0); J["an"+s].rotation.set(P["an"+s],0,0); });
  try{ F.ch.deformGarment(0.75*Math.sin(Math.max(0,Math.min(1.1,P.hpLf))), 0.75*Math.sin(Math.max(0,Math.min(1.1,P.hpRf)))); }catch(e){}
}
var _v=new T.Vector3();
function ground(F, P, noAnc){ var J=F.J, r=J.root, sp=J.spin;
  r.position.set(P.x, F.hipY, P.z); sp.updateMatrixWorld(true);
  var minY=1e9; F.probes.forEach(function(p){ _v.setFromMatrixPosition(p.matrixWorld); sp.worldToLocal(_v); if(_v.y<minY) minY=_v.y; });
  var dy=-minY, dx=0, dz=0;
  if(!noAnc && F.rest && P.anc!=="none"){ var ks=P.anc==="both"?["L","R"]:[P.anc], ax=0, az=0, rx=0, rz=0;
    ks.forEach(function(s){ _v.setFromMatrixPosition(J["heel"+s].matrixWorld); sp.worldToLocal(_v); ax+=_v.x; az+=_v.z; rx+=F.rest[s].x+P.x; rz+=F.rest[s].z+P.z; });
    dx=(rx-ax)/ks.length; dz=(rz-az)/ks.length; }
  r.position.set(P.x+dx, F.hipY+dy+(P.lift||0), P.z+dz);
  return r.position;
}

function mount(box, o){
  o=o||{};
  var W=box.clientWidth||320, Hh=box.clientHeight||360;
  var rnd; try{ rnd=new T.WebGLRenderer({antialias:true, alpha:true}); rnd.domElement.dataset.ib3d="no1"; }catch(e){ box.innerHTML='<div class="mut small" style="padding:30px;text-align:center">3D tidak disokong / 3D not supported</div>'; return null; }
  rnd.setPixelRatio(Math.min(2, window.devicePixelRatio||1)); rnd.setSize(W, Hh); box.appendChild(rnd.domElement); rnd.domElement.style.display="block"; rnd.domElement.style.touchAction="none";
  var sc=new T.Scene(), cam=new T.PerspectiveCamera(30, W/Hh, 0.1, 50);
  sc.add(new T.HemisphereLight(0xffffff, 0x445544, 1.05)); var dl=new T.DirectionalLight(0xffffff, 1.25); dl.position.set(2.5,4,3.5); sc.add(dl); var dl2=new T.DirectionalLight(0xc9d8ff, 0.45); dl2.position.set(-3,2,-2.5); sc.add(dl2);
  // floor: a round platform and a yoga mat
  var floor=new T.Mesh(new T.CylinderGeometry(1.25,1.3,0.06,48), lam(o.floor||"#1d3a2b")); floor.position.y=-0.03; sc.add(floor);
  var ring=new T.Mesh(new T.TorusGeometry(1.26,0.012,6,64), lam("#c9a646")); ring.rotation.x=PI/2; ring.position.y=0.002; sc.add(ring);
  var cv=document.createElement("canvas"); cv.width=cv.height=64; var cx=cv.getContext("2d"), gr=cx.createRadialGradient(32,32,2,32,32,30); gr.addColorStop(0,"rgba(0,0,0,.45)"); gr.addColorStop(1,"rgba(0,0,0,0)"); cx.fillStyle=gr; cx.fillRect(0,0,64,64);
  var shadow=new T.Mesh(new T.PlaneGeometry(0.9,0.9), new T.MeshBasicMaterial({map:new T.CanvasTexture(cv), transparent:true, depthWrite:false})); shadow.rotation.x=-PI/2; shadow.position.y=0.004; sc.add(shadow);
  var props=grp(); sc.add(props);
  var F=null, move=o.move||"idle", sel=o.sel||[], yaw=o.yaw!=null?o.yaw:0.35, yawT=yaw, t0=performance.now(), paused=false, speed=1, dead=false, tempo=o.tempo||1, view=o.view||0;
  function build(){ if(F){ F.spin.parent.remove(F.spin); try{ F.ch.dispose(); }catch(e){} F.spin.traverse(function(x){ if(x.geometry) x.geometry.dispose(); if(x.material) x.material.dispose(); }); }
    F=buildFigure(o.sex||"m", o.col); sc.add(F.spin); paint(); }
  function paint(){ var all=sel.indexOf("all")>=0, a=F.ch.selR.value; for(var i=0;i<15;i++) a[i]=0;
    if(all){ for(var j=1;j<15;j++) a[j]=1; } else sel.forEach(function(p){ (P2REG[p]||[]).forEach(function(r){ a[r]=1; }); }); }
  function setProps(){ while(props.children.length){ var c=props.children[0]; props.remove(c); if(c.geometry) c.geometry.dispose(); }
    var m=Fit3D.moveProp(move), wood=lam("#8a6a48");
    if(m==="mat" || FLOOR[ANIM_OF(move)]){ var mt=new T.Mesh(new T.BoxGeometry(0.62,0.012,1.8), lam("#4f7d6a")); mt.position.set(0,0.006,0.1); props.add(mt); }
    if(m==="chair"){ var seat=new T.Mesh(new T.BoxGeometry(0.44,0.05,0.42), wood); seat.position.set(0,0.43,-0.42); props.add(seat); var back=new T.Mesh(new T.BoxGeometry(0.44,0.45,0.04), wood); back.position.set(0,0.68,-0.62); props.add(back);
      [[0.19,-0.24],[-0.19,-0.24],[0.19,-0.6],[-0.19,-0.6]].forEach(function(p){ var lg=new T.Mesh(new T.BoxGeometry(0.035,0.42,0.035), wood); lg.position.set(p[0],0.21,p[1]); props.add(lg); }); }
    if(m==="wall"){ var wm=lam("#c8c2b2"); wm.transparent=true; wm.opacity=0.55; var wl=new T.Mesh(new T.BoxGeometry(0.8,1.9,0.05), wm); wl.position.set(0,0.95,0.86); props.add(wl); }
    if(m==="step"){ var st=new T.Mesh(new T.BoxGeometry(0.7,0.14,0.32), lam("#8c6d4f")); st.position.set(0,0.07,0.42); props.add(st); }
  }
  function frame(){
    if(dead) return;
    if(!document.body.contains(rnd.domElement)){ dispose(); return; }
    requestAnimationFrame(frame);
    if(document.hidden) return;
    var now=performance.now(), an=ANIM_OF(move), sp=(SPEED[an]||0.6)*tempo;
    var t=o.phase!=null?o.phase/sp:(paused?(t0p):(now-t0)/1000);
    var ph=(t*sp)%1; var P=P0(); try{ (A[an]||A.idle)(ph,P); }catch(e){}
    apply(F,P); var rp=ground(F,P);
    yaw+= (yawT-yaw)*0.15; F.spin.rotation.y=yaw;
    shadow.position.x=rp.x*Math.cos(yaw)+rp.z*Math.sin(yaw); shadow.position.z=-rp.x*Math.sin(yaw)+rp.z*Math.cos(yaw); var sc2=Math.max(0.5,1-(P.lift||0)*1.5); shadow.scale.set(sc2,FLOOR[an]?2.2:sc2,1); props.rotation.y=yaw;
    if(FLOOR[an]){ shadow.position.set(0,0.004,0); shadow.rotation.z=-yaw; }
    F.ch.pulse.value=0.5+0.5*Math.sin(now/300);
    var fl=FLOOR[an], dist=Math.max((o.dist||4.6)*(fl?1.05:1), (fl?4.4:3.7)/Math.max(0.3,cam.aspect)), ty=o.ty!=null?o.ty:(fl?0.42:0.88);
    cam.position.set(0, ty+0.35+(view?0.6:0), dist); cam.lookAt(0, ty, 0);
    rnd.render(sc, cam);
  }
  var t0p=0;
  // drag to turn, tap to pick a body part
  var cnv=rnd.domElement, sx=0, sy=0, moved=false, down=false, yaw0=0, ray=new T.Raycaster(), nd=new T.Vector2();
  cnv.addEventListener("pointerdown", function(e){ down=true; moved=false; sx=e.clientX; sy=e.clientY; yaw0=yawT; try{ cnv.setPointerCapture(e.pointerId); }catch(er){} });
  cnv.addEventListener("pointermove", function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>8 || Math.abs(e.clientY-sy)>8) moved=true; if(moved){ yawT=yaw0+dx*0.012; yaw=yawT; } });
  cnv.addEventListener("pointerup", function(e){ if(!down) return; down=false; if(moved){ if(o.onYaw) o.onYaw(yawT); return; } if(!o.onPick) return;
    var r=cnv.getBoundingClientRect(); nd.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1); ray.setFromCamera(nd, cam);
    var hit=ray.intersectObject(F.spin, true).filter(function(h){ return h.object.visible; })[0];
    var part=null; if(hit){ if(hit.object===F.ch.mesh && hit.face){ part=REG2P[Math.round(F.ch.mesh.geometry.attributes.region.getX(hit.face.a))]||"all"; } else part="all"; }
    o.onPick(part); });
  cnv.addEventListener("pointercancel", function(){ down=false; });
  var ro=window.ResizeObserver?new ResizeObserver(function(){ var w=box.clientWidth, h=box.clientHeight; if(w>10 && h>10){ rnd.setSize(w,h); cam.aspect=w/h; cam.updateProjectionMatrix(); } }):null; if(ro) ro.observe(box);
  function dispose(){ if(dead) return; dead=true; if(ro) ro.disconnect(); sc.traverse(function(x){ if(x.geometry) x.geometry.dispose(); if(x.material){ if(x.material.map) x.material.map.dispose(); x.material.dispose(); } }); try{ rnd.dispose(); rnd.forceContextLoss(); }catch(e){} if(cnv.parentNode) cnv.parentNode.removeChild(cnv); }
  build(); setProps(); requestAnimationFrame(frame);
  return {
    setMove:function(m, tp){ move=m||"idle"; if(tp) tempo=tp; t0=performance.now(); setProps(); var fl=FLOOR[ANIM_OF(move)]; if(o.autoYaw) yawT=fl?1.25:(Fit3D.moveYaw(move)); },
    setSel:function(s){ sel=s||[]; paint(); },
    setSex:function(s, col){ o.sex=s; if(col) o.col=col; build(); },
    setCol:function(col){ o.col=col; var pl=palOf(o.sex||"m", col); ["coat","pants","scarf","skin"].forEach(function(k){ try{ F.ch.setColor(k, pl[k]); }catch(e){} }); if(F.cap) F.cap.visible=!!col.cap; },
    setYaw:function(y){ yawT=y; },
    yaw:function(){ return yawT; },
    pause:function(p){ if(p && !paused){ t0p=(performance.now()-t0)/1000; paused=true; } else if(!p && paused){ t0=performance.now()-t0p*1000; paused=false; } },
    dispose:dispose
  };
}
var MV=null; function ANIM_OF(id){ if(A[id]) return id; if(!MV){ MV={}; (window.FIT_MOVES||[]).concat(window.FIT_WARM||[],window.FIT_COOL||[]).forEach(function(m){ MV[m[0]]=m; }); } var m=MV[id]; return m?m[6]:"idle"; }
return {mount:mount, COAT:COAT, PANTS:PANTS, HIJ:HIJ, SKIN:SKIN,
  moveProp:function(id){ if(!MV) ANIM_OF("x"); var m=MV[id]; return m?(m[10]||""):""; },
  moveYaw:function(id){ var a=ANIM_OF(id); return {lunge:1.0,lungetwist:0.9,lungejump:1.0,squat:0.75,chairsquat:1.1,squatjump:0.7,squatpunch:0.6,kickback:1.1,hinge:1.1,wallpush:1.0,frontkick:0.8,buttkick:0.8,highknee:0.6,sprint:0.7,swim:0.6,inchworm:1.25,toetap:0.8,sidelunge:0.2,cossack:0.15,crossjack:0.35,rdl1:1.2,pistol:0.8,curtsy:0.9,lungekick:0.9,squatkick:0.7,hikneepunch:0.6,powerskip:0.7,legraise:0.2,standcrunch:0.3}[a]||0.35; },
  anim:ANIM_OF};
})();

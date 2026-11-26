/* Astra VPet 2.0 + My Ihsan patches. Built from tools/vpet-astra/src by build.mjs; edit the sources, not this file. */
/* VPet Atelier — original sculpted kitten, layered micro-fur and continuous tail. */
(function (global) {
  'use strict';
  var Art = global.VPetArt = global.VPetArt || {};
  Art.cat = function (THREE, look, lowfx) {
    look = look || {};
    var root = new THREE.Group(); root.name = 'Apricot kitten';
    var rig = new THREE.Group(); root.add(rig); rig.scale.setScalar(0.91);
    var furShaders = [], coats = [], ears = [], paws = [], eyePairs = [];
    var bodyColor = new THREE.Color(look.body || '#e6a365');
    var creamColor = new THREE.Color(look.accent || '#fff1d9');
    var eyeColor = new THREE.Color(look.eye && look.eye !== '#2b2b2b' ? look.eye : '#719590');
    var darkColor = bodyColor.clone().multiplyScalar(0.56);
    var white = new THREE.Color('#fff7e7');
    function clamp(x,a,b) { return Math.max(a,Math.min(b,x)); }
    function smooth(a,b,x) { var f=clamp((x-a)/(b-a),0,1); return f*f*(3-2*f); }
    function mat(color, options) {
      var m = new THREE.MeshStandardMaterial(Object.assign({color:color,roughness:0.69,metalness:0},options || {}));
      return m;
    }
    var pink = mat('#db9b9b',{roughness:0.55}), noseMat = mat('#ba7c78',{roughness:0.36});
    var mouthMat = mat('#694c43',{roughness:0.75});
    function mesh(geo, material, parent) {
      var o = new THREE.Mesh(geo, material); o.castShadow=!lowfx; o.receiveShadow=true;
      (parent || rig).add(o); return o;
    }
    function oval(parent, x,y,z, sx,sy,sz, material, seg) {
      var o=mesh(new THREE.SphereGeometry(1,seg || 20,lowfx?10:14),material,parent);
      o.position.set(x,y,z); o.scale.set(sx,sy,sz); return o;
    }
    function mergeParts(parent, parts, material) {
      var positions=[],normals=[],uvs=[];
      parts.forEach(function(o) {
        o.updateMatrix();var g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrix);
        Array.prototype.push.apply(positions,Array.from(g.attributes.position.array));
        Array.prototype.push.apply(normals,Array.from(g.attributes.normal.array));
        if(g.attributes.uv)Array.prototype.push.apply(uvs,Array.from(g.attributes.uv.array));
        parent.remove(o);o.geometry.dispose();g.dispose();
      });
      var geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
      if(uvs.length)geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
      return mesh(geo,material,parent);
    }
    function colorGeometry(geo, fn) {
      var p=geo.attributes.position, colors=new Float32Array(p.count*3);
      for(var i=0;i<p.count;i++) {
        var c=fn(p.getX(i),p.getY(i),p.getZ(i));
        colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
      }
      geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    }
    function furMaterial(layer, length, density, face) {
      var m=mat('#ffffff',{vertexColors:true,roughness:0.93,side:THREE.FrontSide});
      var key='vpet-kitten-fur-'+layer+'-'+length+'-'+density+'-'+!!face;
      m.customProgramCacheKey=function(){return key;};
      m.onBeforeCompile=function(shader) {
        shader.uniforms.vpFurTime={value:0};
        shader.vertexShader='uniform float vpFurTime; varying vec2 vpFurUV; varying vec3 vpFurNormal; varying vec3 vpFurRoot;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
          '#include <begin_vertex>\nvpFurUV=uv; vpFurNormal=normal; vpFurRoot=position;\n'+
          (face?'float vpEyeL=length((position.xy-vec2(-.325,.025))/vec2(.255,.275)); float vpEyeR=length((position.xy-vec2(.325,.025))/vec2(.255,.275)); float vpFaceFront=smoothstep(.28,.49,position.z); float vpEyeKeep=smoothstep(.95,1.35,min(vpEyeL,vpEyeR)); float vpMuzzleKeep=smoothstep(-.13,.10,position.y); float vpCoatKeep=mix(1.0,min(vpEyeKeep,vpMuzzleKeep),vpFaceFront);\n':'float vpCoatKeep=1.0;\n')+
          'transformed += objectNormal * '+(length*layer).toFixed(5)+' * vpCoatKeep;\n'+
          'transformed.y -= '+(length*layer*layer*0.28).toFixed(5)+';\n'+
          'transformed.x += sin(vpFurTime*1.7+position.y*4.0)*'+(length*layer*layer*0.07).toFixed(5)+';');
        shader.fragmentShader='varying vec2 vpFurUV; varying vec3 vpFurNormal; varying vec3 vpFurRoot;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',
          '#include <color_fragment>\n'+
          'vec2 furGrid = vpFurUV * vec2('+(density*1.65).toFixed(1)+','+density.toFixed(1)+');\n'+
          'vec2 furCell = floor(furGrid);\n'+
          'float furHash = fract(sin(dot(furCell,vec2(127.1,311.7)))*43758.5453);\n'+
          'vec2 furPoint=fract(furGrid)-vec2(0.5)+vec2((furHash-.5)*.35,0.0);\n'+
          (face&&layer>0?'float vpEyeL=length((vpFurRoot.xy-vec2(-.325,.025))/vec2(.255,.275)); float vpEyeR=length((vpFurRoot.xy-vec2(.325,.025))/vec2(.255,.275)); float vpFaceFront=smoothstep(.28,.49,vpFurRoot.z); float vpFaceKeep=mix(1.0,min(smoothstep(.95,1.35,min(vpEyeL,vpEyeR)),smoothstep(-.13,.10,vpFurRoot.y)),vpFaceFront); if(vpFaceKeep < '+(.12+layer*.65).toFixed(3)+') discard;\n':'')+
          (layer>0 ? 'float furRadius='+(.56-layer*.43).toFixed(4)+'; if(length(furPoint*vec2(1.0,0.64))>furRadius || furHash<'+(layer*.12).toFixed(4)+') discard;\n' : '')+
          'diffuseColor.rgb *= '+(0.96+layer*.06).toFixed(4)+' + (furHash-.5)*'+(face?'0.012':'0.035')+';');
        furShaders.push(shader);
      };
      return m;
    }
    function furry(geometry, parent, length, count, density, face) {
      var group=new THREE.Group(); parent.add(group);
      mesh(geometry,furMaterial(0,0,density || 135,face),group);
      for(var k=1;k<=count;k++) {
        var layer=mesh(geometry,furMaterial(k/count,length,density || 135,face),group);
        layer.castShadow=false; layer.receiveShadow=true;
      }
      coats.push(group); return group;
    }
    function sculptSphere(w,h,d,kind,seg) {
      var geo=new THREE.SphereGeometry(1,seg || (lowfx?24:32),lowfx?16:22);
      var p=geo.attributes.position;
      for(var i=0;i<p.count;i++) {
        var x=p.getX(i),y=p.getY(i),z=p.getZ(i);
        if(kind==='head') {
          var cheek=Math.exp(-Math.pow((y+.32)/.48,2));
          var muzzle=Math.exp(-Math.pow((y+.36)/.32,2))*Math.exp(-Math.pow(x/.73,4));
          p.setXYZ(i,x*w*(1+.10*cheek),y*h-.035*x*x,z*d+Math.max(0,z)*.13*muzzle);
        } else if(kind==='body') {
          p.setXYZ(i,x*w*(1-.12*y),y*h,z*d);
        } else p.setXYZ(i,x*w,y*h,z*d);
      }
      geo.computeVertexNormals(); return geo;
    }
    var bodyGeo=sculptSphere(.65,.73,.85,'body');
    colorGeometry(bodyGeo,function(x,y,z) {
      var chest=smooth(.24,.55,z)*(1-smooth(.20,.62,Math.abs(x)))*smooth(-.65,-.16,y);
      var c=bodyColor.clone().lerp(creamColor,chest*.96);
      if(look.pattern==='stripes') {
        var stripes=Math.pow(Math.max(0,Math.sin(z*18+y*2)),10)*smooth(.30,.56,Math.abs(x));
        c.lerp(darkColor,stripes*.5);
      } else if(look.pattern==='spots' || look.pattern==='patch') {
        var v=Math.sin(z*8+x*7)*Math.sin(y*9-z*3);
        c.lerp(darkColor,smooth(.50,.72,v)*.43*(1-chest));
      }
      return c;
    });
    var torso=furry(bodyGeo,rig,.047,lowfx?1:3,160); torso.position.set(0,.99,-.17);
    var headPivot=new THREE.Group(); headPivot.position.set(0,1.83,.49); rig.add(headPivot);
    var head=new THREE.Group(); headPivot.add(head);
    var headGeo=sculptSphere(.77,.70,.65,'head');
    colorGeometry(headGeo,function(x,y,z) {
      var lower=1-smooth(-.12,.10,y+.10*Math.cos(x*5));
      var face=smooth(.24,.47,z)*lower;
      var blaze=(1-smooth(.08,.21,Math.abs(x)))*smooth(.20,.46,z)*(1-smooth(.13,.54,y));
      var c=bodyColor.clone().lerp(creamColor,Math.max(face,blaze)*.98);
      if(look.pattern==='stripes') {
        var stripe=Math.pow(Math.max(0,Math.cos(x*23+y*2)),14)*smooth(.26,.60,y)*smooth(.12,.40,z);
        c.lerp(darkColor,stripe*.56);
      }
      return c;
    });
    furry(headGeo,head,.034,lowfx?1:4,185,true);
    function earShape(small) {
      var s=new THREE.Shape(),f=small || 1;
      s.moveTo(-.27*f,0);
      s.bezierCurveTo(-.30*f,.15*f,-.20*f,.51*f,-.09*f,.65*f);
      s.bezierCurveTo(-.055*f,.69*f,-.015*f,.66*f,.025*f,.61*f);
      s.bezierCurveTo(.12*f,.49*f,.26*f,.15*f,.27*f,0);
      s.quadraticCurveTo(.0*f,-.15*f,-.27*f,0);
      return s;
    }
    [-1,1].forEach(function(side) {
      var ear=new THREE.Group(); ear.position.set(side*.48,.43,-.08); ear.rotation.z=-side*.30; head.add(ear);
      var outer=new THREE.ExtrudeGeometry(earShape(1),{depth:.10,bevelEnabled:true,bevelSize:.042,bevelThickness:.045,bevelSegments:3,steps:1,curveSegments:8});
      colorGeometry(outer,function(){return bodyColor;});
      furry(outer,ear,.025,lowfx?0:1,140);
      var innerGeo=new THREE.ExtrudeGeometry(earShape(.63),{depth:.014,bevelEnabled:true,bevelSize:.024,bevelThickness:.015,bevelSegments:2,steps:1,curveSegments:7});
      var inn=mesh(innerGeo,pink,ear); inn.position.set(0,.055,.15);
      ears.push(ear);
    });
    var socketMat=mat('#795945',{roughness:.55});
    var irisMat=new THREE.MeshPhysicalMaterial({color:eyeColor,roughness:.18,metalness:.03,clearcoat:1,clearcoatRoughness:.10});
    var pupilMat=mat('#182629',{roughness:.12});
    var shineMat=new THREE.MeshBasicMaterial({color:'#ffffff'});
    var irisRim=mat(eyeColor.clone().multiplyScalar(.57),{roughness:.3});
    [-1,1].forEach(function(side) {
      var eg=new THREE.Group(); eg.position.set(side*.325,.025,.555); eg.rotation.y=side*.12; head.add(eg);
      oval(eg,0,0,0,.201,.220,.080,socketMat,22);
      oval(eg,0,.006,.027,.179,.198,.082,irisRim,22);
      var eye=new THREE.Group(); eg.add(eye);
      oval(eye,0,.008,.048,.159,.178,.080,irisMat,22);
      oval(eye,0,.010,.110,.077,.140,.022,pupilMat,20);
      oval(eye,-.047,.083,.135,.041,.044,.014,shineMat,12);
      oval(eye,.061,-.053,.131,.017,.021,.012,shineMat,10);
      var lidCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.16,-.002,.07),new THREE.Vector3(-.08,-.035,.10),new THREE.Vector3(0,-.047,.11),new THREE.Vector3(.08,-.035,.10),new THREE.Vector3(.16,-.002,.07)]);
      var lid=mesh(new THREE.TubeGeometry(lidCurve,12,.015,5,false),mouthMat,head);
      lid.position.copy(eg.position); lid.rotation.copy(eg.rotation); lid.visible=false;
      eyePairs.push({socket:eg,eye:eye,lid:lid});
      var brow=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.12,0,0),new THREE.Vector3(0,.045,.01),new THREE.Vector3(.10,.014,0)]),10,.021,5,false),mat(bodyColor.clone().multiplyScalar(.75)),head);
      brow.position.set(side*.325,.310,.510); brow.rotation.z=side*-.10;
    });
    // One gently sculpted muzzle is part of the head; the nose and lips sit on its surface.
    var noseShape=new THREE.Shape(); noseShape.moveTo(-.105,.025); noseShape.quadraticCurveTo(-.10,.064,0,.052); noseShape.quadraticCurveTo(.10,.064,.105,.025); noseShape.quadraticCurveTo(.045,-.045,0,-.055); noseShape.quadraticCurveTo(-.045,-.045,-.105,.025);
    var nose=mesh(new THREE.ExtrudeGeometry(noseShape,{depth:.024,bevelEnabled:true,bevelSize:.018,bevelThickness:.016,bevelSegments:3,curveSegments:8}),noseMat,head); nose.position.set(0,-.210,.718);
    var mouth=new THREE.Group(); mouth.position.set(0,-.265,.724); head.add(mouth);
    [-1,1].forEach(function(side) {
      var curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.027,0),new THREE.Vector3(side*.025,-.025,0),new THREE.Vector3(side*.075,-.034,-.004),new THREE.Vector3(side*.126,.004,-.014)]);
      mesh(new THREE.TubeGeometry(curve,12,.009,5,false),mouthMat,mouth);
    });
    var openMouth=oval(head,0,-.31,.728,.064,.050,.019,mouthMat,16); openMouth.visible=false;
    var tongue=oval(head,0,-.346,.744,.040,.022,.009,pink,12); tongue.visible=false;
    // Fine whiskers are curved filaments, never rigid rods or beads.
    var whiskerMat=mat('#f1e7d8',{roughness:.8}),freckleMat=mat('#aa8766'),whiskerParts=[],freckleParts=[];
    [-1,1].forEach(function(side) {
      for(var k=0;k<3;k++) {
        var yy=-.215+(k-1)*.055;
        var curve=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.32,yy,.62),new THREE.Vector3(side*.60,yy+(k-1)*.030,.67),new THREE.Vector3(side*.91,yy+(k-1)*.095,.61)]);
        var whisker=mesh(new THREE.TubeGeometry(curve,8,.0044,3,false),whiskerMat,head); whisker.castShadow=false;whiskerParts.push(whisker);
      }
      // Small pigment freckles are printed into one tiny smooth patch.
      for(var j=0;j<3;j++) freckleParts.push(oval(head,side*(.245+j*.053),-.223+(j%2)*.043,.686-j*.013,.012,.010,.005,freckleMat,8));
    });
    mergeParts(head,whiskerParts,whiskerMat).castShadow=false;mergeParts(head,freckleParts,freckleMat).castShadow=false;
    var legGeo=sculptSphere(.205,.41,.225,'leg',lowfx?14:18);
    colorGeometry(legGeo,function(x,y){return bodyColor.clone().lerp(creamColor,1-smooth(-.29,-.10,y));});
    var pawMat=mat(creamColor,{roughness:.91}),toeMat=mat(creamColor.clone().multiplyScalar(.82));
    [[-.45,.44],[.45,.44],[-.45,-.65],[.45,-.65]].forEach(function(p,i) {
      var pivot=new THREE.Group(); pivot.position.set(p[0],.73,p[1]); rig.add(pivot);
      var leg=furry(legGeo,pivot,.028,lowfx?0:1,125); leg.position.y=-.28;
      var foot=oval(pivot,0,-.61,.070,.228,.123,.284,pawMat,18);
      var toes=[];
      for(var k=-1;k<=1;k++) {
        var toe=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(k*.074,-.616,.298),new THREE.Vector3(k*.074,-.641,.305),new THREE.Vector3(k*.074,-.663,.294)]),4,.006,3,false),toeMat,pivot); toe.castShadow=false;toes.push(toe);
      }
      mergeParts(pivot,toes,toeMat).castShadow=false;
      paws.push({pivot:pivot,leg:leg,foot:foot,phase:(i===0 || i===3)?0:Math.PI,front:i<2});
    });
    // A single analytic tube bends along its entire length, with taper and matching fur shells.
    var tailSegments=lowfx?18:26, tailSides=lowfx?8:10;
    var tailGeo=new THREE.BufferGeometry();
    var tp=new Float32Array((tailSegments+1)*(tailSides+1)*3),tn=new Float32Array(tp.length),tu=new Float32Array((tailSegments+1)*(tailSides+1)*2),tc=new Float32Array(tp.length),ti=[];
    for(var a=0;a<=tailSegments;a++) for(var b=0;b<=tailSides;b++) {
      var ix=a*(tailSides+1)+b,u=a/tailSegments;
      tu[ix*2]=b/tailSides;tu[ix*2+1]=u;
      var co=bodyColor.clone().lerp(creamColor,smooth(.73,.94,u));
      if(look.pattern==='stripes') co.lerp(darkColor,Math.pow(Math.max(0,Math.sin(u*35)),8)*.45*(1-smooth(.75,.9,u)));
      tc[ix*3]=co.r;tc[ix*3+1]=co.g;tc[ix*3+2]=co.b;
      if(a<tailSegments&&b<tailSides) { var v=ix;ti.push(v,v+tailSides+1,v+1,v+1,v+tailSides+1,v+tailSides+2); }
    }
    tailGeo.setAttribute('position',new THREE.BufferAttribute(tp,3));tailGeo.setAttribute('normal',new THREE.BufferAttribute(tn,3));tailGeo.setAttribute('uv',new THREE.BufferAttribute(tu,2));tailGeo.setAttribute('color',new THREE.BufferAttribute(tc,3));tailGeo.setIndex(ti);
    var tail=furry(tailGeo,rig,.037,lowfx?1:2,125); tail.frustumCulled=false;
    var va=new THREE.Vector3(),vb=new THREE.Vector3(),dir=new THREE.Vector3(),normal=new THREE.Vector3(),binormal=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
    function tailPoint(u,t,happy,sleep) {
      var curl=1-sleep*.65;
      return new THREE.Vector3(Math.sin(u*2.5+t*1.4)*(.10+.32*u*u)*(1+happy*.4),.91+u*.72+Math.sin(u*3.8)*.34*curl,-.84-u*.79+u*u*.31);
    }
    function updateTail(t,happy,sleep) {
      for(var a=0;a<=tailSegments;a++) {
        var u=a/tailSegments,p=tailPoint(u,t,happy,sleep); va.copy(tailPoint(Math.max(0,u-.006),t,happy,sleep));vb.copy(tailPoint(Math.min(1,u+.006),t,happy,sleep));
        dir.subVectors(vb,va).normalize();normal.crossVectors(up,dir).normalize();binormal.crossVectors(dir,normal).normalize();
        var radius=.145*Math.pow(1-u,0.52)+.014; if(a===tailSegments)radius=.006;
        for(var b=0;b<=tailSides;b++) {
          var an=b/tailSides*Math.PI*2,id=(a*(tailSides+1)+b)*3;
          var nx=normal.x*Math.cos(an)+binormal.x*Math.sin(an),ny=normal.y*Math.cos(an)+binormal.y*Math.sin(an),nz=normal.z*Math.cos(an)+binormal.z*Math.sin(an);
          tp[id]=p.x+nx*radius;tp[id+1]=p.y+ny*radius;tp[id+2]=p.z+nz*radius;tn[id]=nx;tn[id+1]=ny;tn[id+2]=nz;
        }
      }
      tailGeo.attributes.position.needsUpdate=true;tailGeo.attributes.normal.needsUpdate=true;
      if(!tailGeo.boundingSphere)tailGeo.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,1,-1.1),1.5);
    }
    // Accessories keep the original look contract while remaining quiet and handmade.
    var accessory=new THREE.Group(); head.add(accessory);
    if(look.acc==='bow') {
      var bm=mat('#bd7181',{roughness:.70});
      [-1,1].forEach(function(s){var o=oval(accessory,s*.10,0,0,.14,.09,.055,bm,16);o.rotation.z=s*.3;});
      oval(accessory,0,0,.025,.055,.060,.05,bm,12); accessory.position.set(.49,.51,.23); accessory.rotation.z=-.4;
    } else if(look.acc==='flower') {
      for(var f=0;f<5;f++){var ang=f/5*Math.PI*2;var petal=oval(accessory,Math.cos(ang)*.085,Math.sin(ang)*.085,0,.065,.045,.025,mat('#fff4db'),12);petal.rotation.z=ang;}
      oval(accessory,0,0,.03,.045,.045,.025,mat('#d4aa4d'),12);accessory.position.set(-.50,.48,.23);
    } else if(look.acc==='cap') {
      var cap=mesh(new THREE.SphereGeometry(.50,24,12,0,Math.PI*2,0,Math.PI*.43),mat('#6b9691'),accessory);cap.scale.set(1,.45,1); accessory.position.set(0,.55,-.02);
    } else if(look.acc==='scarf') {
      var scarf=mesh(new THREE.TorusGeometry(.37,.075,8,30),mat('#6b9691'),accessory);scarf.rotation.x=Math.PI/2;accessory.position.set(0,-.49,-.03);
      var sc=oval(accessory,.24,-.13,.28,.09,.24,.05,scarf.material,14);sc.rotation.z=.3;
    }
    var blend={sleep:0,stretch:0,pet:0,roll:0,yawn:0,play:0,eat:0};
    function update(t,dt,a) {
      a=a || {}; dt=Math.min(dt || .016,.08);
      var mode=a.mode || 'idle', phase=a.phase || 0, speed=clamp(a.speed || 0,0,2), happy=clamp(a.happy || 0,0,1);
      var ease=1-Math.exp(-dt*7);
      blend.sleep+=(Number(mode==='sleep')-blend.sleep)*ease;
      blend.stretch+=(Number(mode==='stretch')-blend.stretch)*ease;
      blend.pet+=(Number(mode==='pet' || mode==='kiss')-blend.pet)*ease;
      blend.roll+=(Number(mode==='roll')-blend.roll)*ease;
      blend.yawn+=(Number(mode==='yawn')-blend.yawn)*ease;
      blend.play+=(Number(mode==='play')-blend.play)*ease;
      blend.eat+=(Number(mode==='eat')-blend.eat)*ease;
      var walk=clamp(speed*1.5,0,1),gait=a.gait == null?t*(5+speed*3):a.gait;
      // Anticipation, a soft little pounce, then a long enough pause to feel intentional.
      // The rig only rises: the preparation comes from the body and joints, never the floor.
      var playWeight=blend.play*(1-walk*.8),playCycle=phase%2.8;
      var crouch=playWeight*(smooth(0,.24,playCycle)-smooth(.40,.64,playCycle));
      var hopUnit=clamp((playCycle-.48)/.64,0,1);
      var hopWave=playWeight*Math.sin(hopUnit*Math.PI);
      var breath=Math.sin(t*2.2)*.011;
      rig.position.y=breath+Math.abs(Math.sin(gait))*walk*.042-blend.sleep*.33+hopWave*.168;
      rig.rotation.x=blend.sleep*-.11+blend.stretch*.10-hopWave*.09;
      rig.rotation.z=Math.sin(gait)*walk*.025+blend.roll*Math.sin(phase*2.2)*.95;
      // My Ihsan 0.7.73 (owner): the rig turns around a point on the floor, so a sideways rock pushed the paws on one side under it.
      // Lift by how far the outer paw (x ≈ 0.45 + 0.13 paw) drops, and by the forward/back pitch the same way, so paws and body stay on top of the floor.
      rig.position.y+=Math.abs(Math.sin(rig.rotation.z))*.66+Math.max(0,-Math.sin(rig.rotation.x))*.70;
      torso.position.y=.99-crouch*.075-blend.eat*.035;
      torso.scale.set(1+breath*.5+crouch*.045,1+breath-blend.sleep*.20-blend.stretch*.18-crouch*.105+hopWave*.025-blend.eat*.04,1+blend.stretch*.21+crouch*.035);
      headPivot.position.y=1.83-blend.sleep*.57-blend.stretch*.36-crouch*.15+hopWave*.035-blend.eat*1.05;
      headPivot.position.z=.49+blend.stretch*.25+crouch*.055;
      var hx=clamp(a.lookX || 0,-1,1),hy=clamp(a.lookY || 0,-1,1);
      var targetY=hx*.22+Math.sin(t*.83)*.018;
      var targetX=-hy*.13+blend.sleep*.18+blend.pet*-.10;
      var targetZ=blend.pet*Math.sin(t*2)*.12+Math.sin(t*.62)*.018;
      if(mode==='groom') {targetX=.40;targetY=Math.sin(phase*5)*.13;targetZ=-.24;}
      targetX=targetX*(1-blend.eat)+(.42+Math.sin(phase*8)*.035)*blend.eat;
      if(mode==='sneeze')targetX=Math.sin(Math.min(phase,1)*Math.PI*3)*.20;
      if(mode==='poke') {targetZ=Math.sin(phase*14)*Math.exp(-phase*4)*.15;targetX=-.12*Math.exp(-phase*3);}
      if(mode==='kiss')targetX=-.10;
      head.rotation.y+=(targetY-head.rotation.y)*ease;head.rotation.x+=(targetX-head.rotation.x)*ease;head.rotation.z+=(targetZ-head.rotation.z)*ease;
      ears.forEach(function(ear,i){var side=i===0?-1:1;ear.rotation.z=-side*(.30+blend.sleep*.25)+Math.sin(t*1.1+i*3)*.035;ear.rotation.x=Math.sin(t*.7+i)*.035+(mode==='sneeze'?.22:0);});
      paws.forEach(function(p,i){
        p.pivot.rotation.x=Math.sin(gait+p.phase)*walk*.50+(p.front?-blend.stretch*.56:blend.stretch*.12)+(p.front?-crouch*.08-hopWave*.40:hopWave*.22)+(p.front?-blend.sleep*.55:blend.sleep*.35)-(p.front?blend.eat*.06:0);
        p.pivot.rotation.z=(i%2===0?1:-1)*blend.sleep*.17;
        p.pivot.position.x=(i%2===0?-1:1)*(.45-blend.sleep*.14);
        p.pivot.position.y=.73+blend.sleep*.38;
        p.pivot.position.z=(p.front?.44:-.65)+(p.front?blend.stretch*.27:0);
        if(mode==='groom'&&i===0){p.pivot.rotation.x=-1.1+Math.sin(phase*5)*.15;p.pivot.rotation.z=-.40;}
        if(mode==='kiss'&&i<2){p.pivot.rotation.x=-.32;}
      });
      var blink=Math.max(clamp(a.blink || 0,0,1),blend.sleep*.985,blend.pet*.48,blend.yawn*.7);
      eyePairs.forEach(function(e){
        e.socket.scale.y=Math.max(.035,1-blink*.985);e.socket.visible=blink<.94;e.lid.visible=blink>=.94;
        e.eye.position.x=hx*.029;e.eye.position.y=hy*.024;
      });
      var yaw=Math.sin(Math.min(phase/2,1)*Math.PI)*blend.yawn;
      openMouth.visible=mode==='yawn'||mode==='sneeze'||mode==='kiss'||mode==='groom'||mode==='eat';
      openMouth.scale.y=.050*(mode==='eat'?.42+(.5+.5*Math.sin(phase*11))*.55:1+yaw*4);tongue.visible=mode==='groom'||(mode==='yawn'&&yaw>.3);
      mouth.visible=!openMouth.visible;
      nose.scale.set(1,1,1+(mode==='kiss'?.7:0));
      updateTail(t,clamp(happy+blend.play*.5,0,1),blend.sleep);
      furShaders.forEach(function(s){s.uniforms.vpFurTime.value=t;});
    }
    update(0,.016,{});
    return {root:root,head:head,focus:new THREE.Vector3(0,1.75,.5),update:update};
  };
})(window);


/* Original VPet Studio bird / fish. Three.js r159, classic script, no runtime fetches. */
(function () {
  'use strict';
  var Art = window.VPetArt = window.VPetArt || {};
  var PI = Math.PI;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, v) { var x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); }
  function material(T, color, extra) { return new T.MeshStandardMaterial(Object.assign({ color: color, roughness: .64 }, extra || {})); }
  function sphere(T, parent, geo, mat, position, scale) {
    var mesh = new T.Mesh(geo, mat);
    if (position) mesh.position.set(position[0], position[1], position[2]);
    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function tube(T, points, radius, segments) {
    return new T.TubeGeometry(new T.CatmullRomCurve3(points.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); })), segments || 12, radius, 5, false);
  }
  function merge(T, parts) {
    var positions = [], normals = [], colors = [], uvs = [];
    var v = new T.Vector3(), n = new T.Vector3(), c = new T.Color();
    parts.forEach(function (part) {
      var source = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry;
      var p = source.attributes.position, normal = source.attributes.normal, color = source.attributes.color, uv = source.attributes.uv;
      var mat = part.matrix || new T.Matrix4(), nm = new T.Matrix3().getNormalMatrix(mat);
      c.set(part.color || '#ffffff');
      for (var i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i).applyMatrix4(mat); positions.push(v.x, v.y, v.z);
        n.fromBufferAttribute(normal, i).applyMatrix3(nm).normalize(); normals.push(n.x, n.y, n.z);
        colors.push(color ? color.getX(i) * c.r : c.r, color ? color.getY(i) * c.g : c.g, color ? color.getZ(i) * c.b : c.b);
        uvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
      }
      if (source !== part.geometry) source.dispose();
      part.geometry.dispose();
    });
    var geo = new T.BufferGeometry();
    geo.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new T.Float32BufferAttribute(normals, 3));
    geo.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
    geo.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    return geo;
  }
  function transform(T, x, y, z, rz, ry) {
    return new T.Matrix4().compose(new T.Vector3(x, y, z), new T.Quaternion().setFromEuler(new T.Euler(0, ry || 0, rz || 0)), new T.Vector3(1, 1, 1));
  }
  /* A curved lenticular feather, with a tapered rounded tip and raised central rachis. */
  function feather(T, length, width, bend, lowfx) {
    var rows = lowfx ? 8 : 13, cols = 6, pos = [], col = [], uv = [], ind = [];
    for (var j = 0; j <= rows; j++) {
      var s = j / rows, envelope = Math.pow(Math.sin(PI * (s * .98 + .01)), .62) * (1 - s * .24);
      for (var i = 0; i <= cols; i++) {
        var u = i / cols * 2 - 1;
        pos.push(u * width * envelope, -s * length, bend * s * s + width * .23 * (1 - u * u) * Math.sin(PI * s));
        var center = Math.exp(-Math.abs(u) * 20) * .075, groove = .025 * Math.sin(s * 140 + Math.abs(u) * 18);
        var tint = .85 + center + (1 - Math.abs(u)) * .11 + groove;
        col.push(tint, tint, tint); uv.push(i / cols, s);
        if (j < rows && i < cols) { var a = j * (cols + 1) + i; ind.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2); }
      }
    }
    var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new T.Float32BufferAttribute(col, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
    geo.setIndex(ind); geo.computeVertexNormals(); return geo;
  }
  function eyes(T, head, radius, spacing, y, z, eyeColor, lowfx) {
    var white = new T.MeshPhysicalMaterial({ color: '#fff6df', roughness: .25, clearcoat: .6, clearcoatRoughness: .08 });
    var black = new T.MeshPhysicalMaterial({ color: eyeColor || '#19262b', roughness: .08, clearcoat: 1, clearcoatRoughness: .03 });
    var irisMat = new T.MeshPhysicalMaterial({ color: '#775337', roughness: .24, clearcoat: .7 });
    var glint = new T.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
    var geo = new T.SphereGeometry(1, lowfx ? 16 : 24, lowfx ? 12 : 18), out = [];
    [-1, 1].forEach(function (side) {
      var pivot = new T.Group(); pivot.position.set(side * spacing, y, z); pivot.rotation.y = side * .20; head.add(pivot);
      sphere(T, pivot, geo, white, [0, 0, -.025], [radius * 1.17, radius * 1.22, radius * .56]);
      var iris = new T.Group(); pivot.add(iris);
      sphere(T, iris, geo, irisMat, [0, -.004, radius * .31], [radius * .86, radius, radius * .32]);
      sphere(T, iris, geo, black, [0, .008, radius * .49], [radius * .73, radius * .9, radius * .23]);
      sphere(T, iris, geo, glint, [-radius * .28, radius * .38, radius * .68], [radius * .24, radius * .24, radius * .09]);
      if (!lowfx) sphere(T, iris, geo, glint, [radius * .3, -radius * .27, radius * .7], [radius * .095, radius * .095, radius * .04]);
      out.push({ pivot: pivot, iris: iris });
    });
    return out;
  }
  function updateEyes(out, a, t, sleeping) {
    var blink = sleeping ? .97 : clamp(a.blink || 0, 0, .99);
    out.forEach(function (e) {
      e.pivot.scale.y = Math.max(.035, 1 - blink);
      e.iris.position.x = (a.lookX || 0) * .028;
      e.iris.position.y = (a.lookY || 0) * .021;
    });
  }
  function accessories(T, parent, kind, y, lowfx) {
    var group = new T.Group(); parent.add(group); group.position.set(.38, y, .22);
    var unit = new T.SphereGeometry(1, 16, 10), coral = material(T, '#df927e'), gold = material(T, '#e9bd63', { metalness: .28, roughness: .35 });
    if (kind === 'flower') {
      for (var i = 0; i < 5; i++) { var a = i / 5 * PI * 2; sphere(T, group, unit, material(T, '#fff1d6'), [Math.cos(a) * .13, Math.sin(a) * .13, 0], [.11, .09, .035]); }
      sphere(T, group, unit, gold, [0, 0, .035], [.07, .07, .04]);
    } else if (kind === 'bow') {
      [-1, 1].forEach(function (s) { var m = sphere(T, group, unit, coral, [s * .11, 0, 0], [.14, .1, .06]); m.rotation.z = s * .4; });
      sphere(T, group, unit, gold, [0, 0, .04], [.055, .065, .05]);
    } else if (kind === 'cap') {
      group.position.set(0, y + .03, -.06);
      var cap = new T.Mesh(new T.SphereGeometry(.42, 24, 12, 0, PI * 2, 0, PI / 2), material(T, '#698f82')); cap.scale.y = .55; group.add(cap);
      sphere(T, group, unit, material(T, '#577d70'), [0, .015, .3], [.35, .035, .22]);
    } else if (kind === 'scarf') {
      group.position.set(0, y - 1, 0);
      var scarf = new T.Mesh(new T.TorusGeometry(.46, .085, 8, 32), coral); scarf.rotation.x = PI / 2; scarf.scale.z = 1.1; group.add(scarf);
      sphere(T, group, unit, coral, [.25, -.15, .38], [.09, .22, .035]);
    }
    return group;
  }

  Art.bird = function (T, look, lowfx) {
    look = look || {};
    var root = new T.Group(), rig = new T.Group(); root.add(rig);
    var base = new T.Color(look.body || '#72b9c2'), cream = new T.Color(look.accent || '#fff0c7');
    var dark = base.clone().multiplyScalar(.65), light = base.clone().lerp(new T.Color('#effbf3'), .23);
    var bodyMaterial = material(T, '#ffffff', { vertexColors: true, roughness: .82 });
    /* Fine down is shaded in surface space; visible flight feathers are real curved surfaces. */
    bodyMaterial.onBeforeCompile = function (s) {
      s.vertexShader = 'varying vec3 vpBirdPosition;\n' + s.vertexShader;
      s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvpBirdPosition = position;');
      s.fragmentShader = 'varying vec3 vpBirdPosition;\n' + s.fragmentShader;
      s.fragmentShader = s.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nfloat downA=sin(vpBirdPosition.x*285.0+sin(vpBirdPosition.y*161.0)*2.0)*sin(vpBirdPosition.y*310.0+vpBirdPosition.z*220.0);\ndiffuseColor.rgb *= 0.975+0.025*downA;');
    };
    bodyMaterial.customProgramCacheKey = function () { return 'vpet-bird-down-v1'; };
    var bodyGeometry = new T.SphereGeometry(1, lowfx ? 32 : 48, lowfx ? 24 : 36);
    var p = bodyGeometry.attributes.position, colors = [], c = new T.Color();
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), sy = p.getY(i), z = p.getZ(i), y = .3 + (sy + 1) * .91;
      var pear = 1 + .12 * Math.exp(-Math.pow((sy + .25) / .5, 2)) - .035 * sy;
      x *= .65 * pear; z *= .57 * (1 + .06 * pear);
      var bib = smooth(.13, .48, z) * (1 - smooth(.40, .57, Math.abs(x))) * (1 - smooth(1.91, 2.04, y));
      c.copy(base).lerp(cream, bib * .98);
      c.multiplyScalar(.95 + .05 * smooth(.3, 1.9, y));
      colors.push(c.r, c.g, c.b); p.setXYZ(i, x, y, z);
    }
    bodyGeometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3)); bodyGeometry.computeVertexNormals();
    var body = new T.Mesh(bodyGeometry, bodyMaterial); body.castShadow = !lowfx; body.receiveShadow = true; rig.add(body);
    var head = new T.Group(); head.position.y = 1.62; rig.add(head);
    var eyeParts = eyes(T, head, .143, .285, .045, .48, look.eye || '#172d32', lowfx);
    var unit = new T.SphereGeometry(1, lowfx ? 16 : 24, lowfx ? 12 : 18);
    var blush = material(T, '#e6a395', { roughness: .95 });
    [-1, 1].forEach(function (side) { var cheek = sphere(T, head, unit, blush, [side * .435, -.12, .428], [.105, .062, .017]); cheek.rotation.y = side * .5; });
    var beakMat = new T.MeshPhysicalMaterial({ color: '#e9b85b', roughness: .34, clearcoat: .4 });
    var beak = new T.Group(); beak.position.set(0, -.08, .53); head.add(beak);
    var upper = sphere(T, beak, unit, beakMat, [0, .006, .075], [.125, .084, .21]); upper.rotation.x = .14;
    var lower = sphere(T, beak, unit, material(T, '#cb874b'), [0, -.044, .065], [.093, .034, .154]);
    var nostrilMat = material(T, '#9a743f');
    [-1, 1].forEach(function (s) { sphere(T, beak, unit, nostrilMat, [s * .052, .052, .18], [.012, .008, .008]); });
    var featherMat = material(T, '#ffffff', { vertexColors: true, side: T.DoubleSide, roughness: .76 });
    var wings = [];
    [-1, 1].forEach(function (side) {
      var wing = new T.Group(); wing.position.set(side * .57, 1.3, -.035); wing.rotation.y = side * .18; rig.add(wing);
      var parts = [];
      for (var k = 0; k < (lowfx ? 6 : 8); k++) {
        var f = feather(T, .58 + .14 * Math.sin(k / 8 * PI), .13, .11, lowfx);
        parts.push({ geometry: f, color: dark.clone().lerp(base, k / 12), matrix: transform(T, side * (.025 + k * .033), -.055 * k, .025 + .012 * k, side * (.2 + .055 * k), side * -.16) });
      }
      for (var q = 0; q < (lowfx ? 3 : 5); q++) {
        parts.push({ geometry: feather(T, .4, .135, .08, lowfx), color: light, matrix: transform(T, side * (.015 + q * .035), .02 - q * .054, .093 + q * .016, side * (.12 + q * .035), 0) });
      }
      var wingMesh = new T.Mesh(merge(T, parts), featherMat); wingMesh.castShadow = !lowfx; wing.add(wingMesh); wings.push({ group: wing, side: side });
    });
    var tail = new T.Group(); tail.position.set(0, .65, -.44); tail.rotation.x = .97; rig.add(tail);
    var tailParts = [];
    for (var j = -2; j <= 2; j++) tailParts.push({ geometry: feather(T, .64 - Math.abs(j) * .035, .14, .06, lowfx), color: j % 2 ? base : dark, matrix: transform(T, j * .07, 0, 0, j * .13, 0) });
    tail.add(new T.Mesh(merge(T, tailParts), featherMat));
    var crest = new T.Group(); crest.position.set(0, 2.02, -.06); crest.rotation.x = -.15; rig.add(crest);
    var crestParts = [];
    for (var cr = -1; cr <= 1; cr++) crestParts.push({ geometry: feather(T, .23 + (cr === 0 ? .065 : 0), .06, -.1, lowfx), color: light, matrix: transform(T, cr * .06, 0, -Math.abs(cr) * .025, PI + cr * .16, 0) });
    crest.add(new T.Mesh(merge(T, crestParts), featherMat));
    var feet = [], toeMat = material(T, '#c99862', { roughness: .55 });
    [-1, 1].forEach(function (side) {
      var foot = new T.Group(); foot.position.set(side * .24, .025, .05); rig.add(foot);
      var footParts = [{ geometry: tube(T, [[0, .3, -.05], [0, .15, -.01], [0, .015, .025]], .03, 7), color: '#ffffff' }];
      for (var toe = -1; toe <= 1; toe++) footParts.push({ geometry: tube(T, [[0, .025, 0], [toe * .065, .005, .10], [toe * .1, 0, .2 - Math.abs(toe) * .035]], .022, 6), color: '#ffffff' });
      footParts.push({ geometry: tube(T, [[0, .02, 0], [.02, .005, -.08], [.045, .015, -.12]], .02, 5), color: '#ffffff' });
      foot.add(new T.Mesh(merge(T, footParts), toeMat)); feet.push(foot);
    });
    return {
      root: root, head: head, focus: new T.Vector3(0, 1.5, 0),
      update: function (t, dt, a) {
        a = a || {}; var mode = a.mode || 'idle', phase = a.phase || 0, speed = a.speed || 0, gait = a.gait == null ? t * (8 + speed * 4) : a.gait;
        var sleep = mode === 'sleep', flying = mode === 'play' || mode === 'zoomies' || mode === 'run';
        var pet = mode === 'pet' || mode === 'kiss', bath = mode === 'bath', groom = mode === 'groom';
        rig.position.y = sleep ? -.12 : .015 * Math.sin(t * 2.3) + (speed > .05 ? Math.abs(Math.sin(gait)) * .1 * Math.min(speed, 1) : 0);
        rig.rotation.z = pet ? -.12 + Math.sin(t * 2) * .025 : Math.sin(gait) * .035 * Math.min(speed, 1);
        rig.rotation.x = sleep ? .1 : (mode === 'eat' ? .15 + Math.sin(t * 12) * .08 : 0);
        rig.scale.set(1 + (sleep ? .035 : 0), 1 + Math.sin(t * 2.4) * .008 - (sleep ? .08 : 0), 1 + Math.sin(t * 2.4) * .006);
        if (mode === 'sneeze') { rig.rotation.x = Math.sin(phase * 15) * .16 * Math.exp(-phase * .8); rig.scale.y *= 1 - .05 * Math.sin(phase * 15); }
        if (mode === 'roll') rig.rotation.z = Math.sin(phase * 2) * .32;
        head.rotation.y = (a.lookX || 0) * .11;
        head.rotation.x = -(a.lookY || 0) * .07 + (mode === 'eat' ? Math.sin(t * 12) * .055 : 0);
        head.rotation.z = pet ? -.07 : (mode === 'poke' ? Math.sin(phase * 10) * .15 * Math.exp(-phase) : Math.sin(t * .72) * .024);
        if (groom) { head.rotation.y = -.32 + Math.sin(t * 5) * .05; head.rotation.z = -.22; }
        crest.rotation.x = -.15 + Math.sin(t * 2.2) * .055 + (mode === 'poke' ? -.25 : 0);
        tail.rotation.x = .97 + Math.sin(t * 3.3) * .07;
        tail.rotation.z = Math.sin(t * 2) * .055;
        wings.forEach(function (w) {
          var flap = flying || bath ? Math.sin(t * (bath ? 16 : 11)) * .75 : Math.sin(t * 2.1) * .024;
          w.group.rotation.z = w.side * (sleep ? -.03 : -.035 + flap);
          w.group.rotation.x = flying ? .18 + Math.sin(t * 11 + .4) * .12 : (groom && w.side < 0 ? -.35 : 0);
          w.group.rotation.y = w.side * (.18 + (mode === 'stretch' ? .6 * Math.sin(Math.min(PI, phase * 1.3)) : 0));
        });
        feet.forEach(function (f, i) { f.position.y = .025 + (speed > .05 ? Math.max(0, Math.sin(gait + i * PI)) * .11 : 0); f.rotation.x = speed > .05 ? Math.sin(gait + i * PI) * .18 : 0; });
        lower.rotation.x = (mode === 'eat' || mode === 'yawn') ? .18 + Math.sin(t * (mode === 'eat' ? 13 : 2)) * .15 : 0;
        lower.position.y = -.044 - (mode === 'yawn' ? .045 : 0);
        updateEyes(eyeParts, a, t, sleep);
      }
    };
  };

  function scaleTexture(T, lowfx) {
    var canvas = document.createElement('canvas'); canvas.width = canvas.height = lowfx ? 128 : 256;
    var ctx = canvas.getContext('2d'), size = canvas.width, rows = 12, cols = 18, w = size / cols, h = size / rows;
    ctx.fillStyle = '#c5c5c5'; ctx.fillRect(0, 0, size, size);
    for (var j = -1; j <= rows; j++) for (var i = -1; i <= cols; i++) {
      var x = (i + (j % 2 ? .5 : 0)) * w, y = j * h;
      var gr = ctx.createLinearGradient(x, y, x, y + h * 1.4); gr.addColorStop(0, '#b7b7b7'); gr.addColorStop(.38, '#e5e5e5'); gr.addColorStop(1, '#a2a2a2');
      ctx.beginPath(); ctx.moveTo(x - w * .52, y); ctx.bezierCurveTo(x - w * .6, y + h * .55, x - w * .25, y + h * 1.1, x, y + h * 1.12); ctx.bezierCurveTo(x + w * .25, y + h * 1.1, x + w * .6, y + h * .55, x + w * .52, y); ctx.closePath(); ctx.fillStyle = gr; ctx.fill();
      ctx.lineWidth = size / 650; ctx.strokeStyle = '#9b9b9b'; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - w * .36, y + h * .55); ctx.quadraticCurveTo(x, y + h * 1.13, x + w * .36, y + h * .55); ctx.strokeStyle = '#f1f1f1'; ctx.stroke();
    }
    var texture = new T.CanvasTexture(canvas); texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.anisotropy = lowfx ? 1 : 4; return texture;
  }
  /* Continuous, thin fins with a curved rim. Vertices keep rest positions for traveling-wave flex. */
  function finGeometry(T, kind, side, lowfx) {
    var rows = lowfx ? 10 : 18, cols = lowfx ? 8 : 16, pos = [], uv = [], color = [], ind = [];
    for (var j = 0; j <= rows; j++) {
      var s = j / rows;
      for (var i = 0; i <= cols; i++) {
        var u = i / cols, a = (u * 2 - 1), x, y, z;
        if (kind === 'tail') {
          x = .018 * Math.sin(PI * u) * Math.sin(PI * s);
          y = a * (.05 + s * .80) * (.92 + .08 * Math.cos(a * PI));
          z = -s * (.72 + .30 * Math.pow(Math.abs(a), .8)) - .035;
        } else if (kind === 'side') {
          x = side * (s * (.24 + .26 * Math.sin(PI * u)));
          y = -.025 - s * (.21 + a * .16);
          z = -s * (.2 + u * .55);
        } else {
          x = a * .025 * Math.sin(PI * s);
          y = (kind === 'dorsal' ? 1 : -1) * s * (.12 + .26 * Math.sin(PI * u));
          z = .43 - u * 1.12 - s * .15;
        }
        pos.push(x, y, z); uv.push(u, s);
        var tint = .83 + .12 * (1 - s);
        color.push(1, tint, tint * .84);
        if (j < rows && i < cols) { var at = j * (cols + 1) + i; ind.push(at, at + cols + 1, at + 1, at + 1, at + cols + 1, at + cols + 2); }
      }
    }
    var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setAttribute('color', new T.Float32BufferAttribute(color, 3)); geo.setIndex(ind); geo.computeVertexNormals();
    geo.userData.rest = new Float32Array(pos); geo.userData.kind = kind; return geo;
  }
  Art.fish = function (T, look, lowfx) {
    look = look || {};
    var root = new T.Group(), rig = new T.Group(); root.add(rig);
    var base = new T.Color(look.body || '#ed9b43'), cream = new T.Color(look.accent || '#fff0d3');
    var texture = scaleTexture(T, lowfx);
    var skin = new T.MeshPhysicalMaterial({ color: '#ffffff', vertexColors: true, roughness: .43, metalness: .08, clearcoat: .55, clearcoatRoughness: .22, iridescence: lowfx ? .12 : .38, iridescenceIOR: 1.31, iridescenceThicknessRange: [120, 360], bumpMap: texture, bumpScale: lowfx ? .013 : .026 });
    var shaderRef = null;
    skin.onBeforeCompile = function (s) {
      s.uniforms.vpFishTime = { value: 0 }; shaderRef = s;
      s.vertexShader = 'varying vec3 vpFishPosition;\n' + s.vertexShader;
      s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvpFishPosition=position;');
      s.fragmentShader = 'uniform float vpFishTime; varying vec3 vpFishPosition;\n' + s.fragmentShader;
      s.fragmentShader = s.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' +
        'float scaleRow=vpFishPosition.z*10.0;\n' +
        'float scaleAround=atan(vpFishPosition.y/0.61,vpFishPosition.x/0.76)*4.45;\n' +
        'vec2 sq=fract(vec2(scaleAround+mod(floor(scaleRow),2.0)*0.5,scaleRow))-0.5;\n' +
        'float scaleArc=abs(length(vec2(sq.x*1.7,(sq.y+0.24)*1.15))-0.67);\n' +
        'float scaleEdge=(1.0-smoothstep(0.025,0.075,scaleArc))*smoothstep(-0.23,-0.08,sq.y);\n' +
        'float scaleMask=1.0-smoothstep(0.50,0.91,vpFishPosition.z);\n' +
        'float scaleSheen=pow(max(0.0,1.0-length(vec2(sq.x*1.8,(sq.y+0.06)*1.5))),3.0);\n' +
        'diffuseColor.rgb *= 1.0-scaleEdge*scaleMask*0.18+scaleSheen*scaleMask*0.065;');
    };
    skin.customProgramCacheKey = function () { return 'vpet-iridescent-scales-v2'; };
    var bodyGeometry = new T.SphereGeometry(1, lowfx ? 36 : 52, lowfx ? 24 : 36), p = bodyGeometry.attributes.position, color = [], c = new T.Color();
    /* Rotate sphere's polar axis onto Z: its UV scales follow the body, not screen space. */
    for (var i = 0; i < p.count; i++) {
      var originalY = p.getY(i), x = p.getX(i), y = -p.getZ(i), z = originalY * 1.04;
      var shape = 1 + .18 * originalY - .1 * Math.max(0, -originalY);
      x *= .76 * shape; y *= .61 * shape;
      var belly = 1 - smooth(-.48, .12, y); c.copy(base).lerp(cream, belly * .96);
      if (look.pattern === 'patch' || look.pattern === 'spots') {
        var patch = smooth(.26, .43, Math.sin(z * 4.3 + 1.1) * Math.cos(x * 4.5) - y * .25);
        c.lerp(cream, patch * .86);
      } else if (look.pattern === 'stripes') {
        var stripe = Math.pow(Math.max(0, Math.sin(z * 14 + y * 1.1)), 9) * .19;
        c.multiplyScalar(1 - stripe);
      }
      color.push(c.r, c.g, c.b); p.setXYZ(i, x, y, z);
    }
    bodyGeometry.setAttribute('color', new T.Float32BufferAttribute(color, 3)); bodyGeometry.computeVertexNormals();
    var restBody = new Float32Array(p.array), body = new T.Mesh(bodyGeometry, skin); body.castShadow = !lowfx; rig.add(body);
    var head = new T.Group(); head.position.set(0, .02, .48); rig.add(head);
    var eyeParts = eyes(T, head, .174, .412, .125, .398, look.eye || '#263032', lowfx);
    var unit = new T.SphereGeometry(1, lowfx ? 14 : 20, lowfx ? 10 : 16);
    var blushMat = material(T, '#e9917d', { roughness: .6 });
    [-1, 1].forEach(function (side) { var cheek = sphere(T, head, unit, blushMat, [side * .515, -.055, .36], [.086, .052, .018]); cheek.rotation.y = side * .55; });
    var lipMat = new T.MeshPhysicalMaterial({ color: '#f6cb9c', roughness: .3, clearcoat: .65 });
    var mouth = new T.Group(); mouth.position.set(0, -.105, .575); head.add(mouth);
    var mouthShadow = sphere(T, mouth, unit, material(T, '#a15f42'), [0, 0, 0], [.071, .036, .018]);
    var lips = new T.Mesh(new T.TorusGeometry(.061, .016, 8, 24), lipMat); lips.scale.y = .64; lips.position.z = .012; mouth.add(lips);
    var finColor = base.clone().lerp(cream, .24);
    var finMat = new T.MeshPhysicalMaterial({ color: finColor, vertexColors: true, side: T.DoubleSide, roughness: .47, metalness: .04, transparent: true, opacity: .78, depthWrite: false, clearcoat: .4, clearcoatRoughness: .22, iridescence: lowfx ? 0 : .22 });
    finMat.onBeforeCompile = function (s) {
      s.vertexShader = 'varying vec2 vpFinUV;\n' + s.vertexShader;
      s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvpFinUV=uv;');
      s.fragmentShader = 'varying vec2 vpFinUV;\n' + s.fragmentShader;
      s.fragmentShader = s.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nfloat finRay=pow(abs(cos((vpFinUV.x+sin(vpFinUV.y*2.5)*0.012)*40.8407)),32.0);\nfloat finRim=smoothstep(0.91,1.0,vpFinUV.y);\ndiffuseColor.rgb *= 0.92+0.14*finRay-0.15*finRim;\ndiffuseColor.a *= 0.89+0.11*finRay;');
    };
    finMat.customProgramCacheKey = function () { return 'vpet-fan-rays-v2'; };
    var fins = [], tail = new T.Group(); tail.position.z = -.94; rig.add(tail);
    function addFin(kind, side, parent, position) {
      var geo = finGeometry(T, kind, side, lowfx), mesh = new T.Mesh(geo, finMat); mesh.position.set(position[0], position[1], position[2]);
      parent.add(mesh); fins.push({ mesh: mesh, geo: geo, kind: kind, side: side }); return mesh;
    }
    addFin('tail', 0, tail, [0, 0, 0]);
    addFin('dorsal', 0, rig, [0, .52, -.02]);
    addFin('ventral', 0, rig, [0, -.46, -.06]);
    [-1, 1].forEach(function (side) { addFin('side', side, rig, [side * .66, -.08, .21]); });
    /* Low contrast gill creases sit flush against the body as smooth curved tubes. */
    var gillMat = material(T, base.clone().multiplyScalar(.72), { roughness: .4 });
    [-1, 1].forEach(function (side) {
      var gill = new T.Mesh(tube(T, [[side * .69, .21, .45], [side * .755, .05, .39], [side * .74, -.14, .35]], .009, 12), gillMat); rig.add(gill);
    });
    var normalCounter = 0;
    return {
      root: root, head: head, focus: new T.Vector3(0, 0, .2),
      update: function (t, dt, a) {
        a = a || {}; var mode = a.mode || 'idle', phase = a.phase || 0, speed = a.speed || 0, sleep = mode === 'sleep';
        var frequency = sleep ? 1.7 : 3.5 + Math.min(speed, 2) * 3, amplitude = sleep ? .045 : .12 + speed * .07;
        if (mode === 'zoomies') { frequency = 13; amplitude = .3; }
        var wave = Math.sin(t * frequency);
        rig.rotation.z = sleep ? -.12 : Math.sin(t * 1.4) * .045 + (mode === 'roll' ? Math.sin(phase * 1.8) * .6 : 0);
        rig.rotation.x = mode === 'eat' ? -.10 + Math.sin(t * 8) * .07 : Math.sin(t * 1.2) * .035;
        if (mode === 'pet' || mode === 'kiss') rig.rotation.z = Math.sin(t * 2.5) * .10;
        rig.position.y = Math.sin(t * 1.5) * (sleep ? .018 : .035);
        tail.rotation.y = wave * amplitude;
        for (var k = 0; k < p.count; k++) {
          var at = k * 3, z = restBody[at + 2], influence = Math.pow(clamp((.45 - z) / 1.5, 0, 1), 2);
          p.array[at] = restBody[at] + Math.sin(t * frequency + z * 2.9) * amplitude * .2 * influence;
          p.array[at + 1] = restBody[at + 1]; p.array[at + 2] = z;
        }
        p.needsUpdate = true;
        fins.forEach(function (f, fi) {
          var attr = f.geo.attributes.position, rest = f.geo.userData.rest, uv = f.geo.attributes.uv;
          for (var q = 0; q < attr.count; q++) {
            var index = q * 3, s = uv.getY(q), u = uv.getX(q), flutter = Math.sin(t * frequency + s * 3.2 + u * 2.7 + fi * .7);
            attr.array[index] = rest[index] + flutter * amplitude * s * s * (f.kind === 'side' ? .14 : .37);
            attr.array[index + 1] = rest[index + 1] + (f.kind === 'side' ? flutter * .055 * s : Math.sin(t * 1.8 + u * 5) * .018 * s);
            attr.array[index + 2] = rest[index + 2] + flutter * .025 * s;
          }
          attr.needsUpdate = true;
          if (f.kind === 'side') f.mesh.rotation.z = f.side * (Math.sin(t * (sleep ? 2 : 6) + fi) * .16 + (mode === 'play' ? .18 : 0));
        });
        if ((++normalCounter % (lowfx ? 5 : 3)) === 0) { bodyGeometry.computeVertexNormals(); fins.forEach(function (f) { f.geo.computeVertexNormals(); }); }
        head.rotation.y = (a.lookX || 0) * .045;
        head.rotation.x = -(a.lookY || 0) * .045;
        mouth.scale.y = mode === 'eat' || mode === 'kiss' || mode === 'yawn' ? 1.25 + Math.sin(t * 9) * .35 : .8 + Math.sin(t * 2.6) * .18;
        mouth.position.z = .575 + (mode === 'kiss' ? .07 : 0);
        if (shaderRef) shaderRef.uniforms.vpFishTime.value = t;
        updateEyes(eyeParts, a, t, sleep);
      }
    };
  };
}());


/* VPet Studio — original, locally generated miniature habitats. */
(function (global) {
  'use strict';
  var Art = global.VPetArt = global.VPetArt || {};

  Art.habitat = function (THREE, species, lowfx) {
    var root = new THREE.Group();
    root.name = 'VPet habitat ' + species;
    var animated = [], timeUniforms = [], skyMaterials = [], bubbleData = [];
    var bubbleMesh = null, toy = null, seed = 14991;
    var unitDummy = new THREE.Object3D();
    function random() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function material(color, opts) {
      return new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.8, metalness: 0 }, opts || {}));
    }
    function mesh(geo, mat, parent, x, y, z) {
      var object = new THREE.Mesh(geo, mat);
      object.position.set(x || 0, y || 0, z || 0);
      object.castShadow = !lowfx;
      object.receiveShadow = !lowfx;
      (parent || root).add(object);
      return object;
    }
    function canvasTexture(width, height, paint, repeat) {
      var canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      paint(canvas.getContext('2d'), width, height);
      var texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      if (repeat) texture.repeat.set(repeat[0], repeat[1]);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }
    var woodTexture = canvasTexture(256, 128, function (ctx, w, h) {
      ctx.fillStyle = '#ddc4a2'; ctx.fillRect(0, 0, w, h);
      for (var i = 0; i < 100; i++) {
        var py = random() * h;
        ctx.strokeStyle = 'rgba(119,86,56,' + (0.025 + random() * 0.09) + ')';
        ctx.lineWidth = 0.5 + random() * 1.1; ctx.beginPath();
        ctx.moveTo(0, py); ctx.bezierCurveTo(w * .35, py + 3, w * .6, py - 5, w, py + 1); ctx.stroke();
      }
    });
    var fabricTexture = canvasTexture(128, 128, function (ctx, w, h) {
      ctx.fillStyle = '#cad7b5'; ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1.3;
      for (var yy = -8; yy < h + 8; yy += 8) for (var xx = -8; xx < w + 8; xx += 8) {
        ctx.strokeStyle = '#b4c59d'; ctx.beginPath(); ctx.moveTo(xx, yy - 3); ctx.quadraticCurveTo(xx + 1, yy + 3, xx + 4, yy + 6); ctx.quadraticCurveTo(xx + 7, yy + 3, xx + 8, yy - 3); ctx.stroke();
        ctx.strokeStyle = '#dce5cb'; ctx.beginPath(); ctx.moveTo(xx + 1.6, yy - 2); ctx.lineTo(xx + 4, yy + 3); ctx.stroke();
      }
    }, [3, 2]);
    var leafGeometry = function (length, width, curl, sections) {
      var p = [], uv = [], ix = [], n = sections || 12;
      for (var j = 0; j <= n; j++) {
        var v = j / n, span = Math.pow(Math.sin(Math.PI * v), .82) * width;
        for (var k = 0; k < 3; k++) {
          var u = k / 2, side = (u - .5) * 2;
          p.push(side * span, length * v, Math.sin(v * Math.PI * .7) * curl + Math.abs(side) * span * .22);
          uv.push(u, v);
        }
      }
      for (var row = 0; row < n; row++) for (var col = 0; col < 2; col++) {
        var a = row * 3 + col, b = a + 3;
        ix.push(a, b, a + 1, b, b + 1, a + 1);
      }
      var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(ix); geo.computeVertexNormals(); return geo;
    };
    function curvedTube(points, radius, mat, parent, segments) {
      return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); })), segments || 30, radius, lowfx ? 5 : 8, false), mat, parent);
    }
    function pot(parent, x, y, z, radius, height, color) {
      var group = new THREE.Group(); group.position.set(x, y, z); parent.add(group);
      var points = [new THREE.Vector2(radius * .62, 0), new THREE.Vector2(radius * .7, .04), new THREE.Vector2(radius * .96, height * .92), new THREE.Vector2(radius, height), new THREE.Vector2(radius * .85, height), new THREE.Vector2(radius * .82, height * .89)];
      mesh(new THREE.LatheGeometry(points, lowfx ? 18 : 32), material(color, { roughness: .73, side: THREE.DoubleSide }), group);
      var soil = mesh(new THREE.CircleGeometry(radius * .84, 24), material('#50483a'), group, 0, height * .89, 0); soil.rotation.x = -Math.PI / 2;
      return group;
    }
    function plant(parent, x, y, z, scale, foliageColor, potColor) {
      var plantRoot = pot(parent, x, y, z, .36 * scale, .55 * scale, potColor || '#d6aa89');
      var foliage = new THREE.Group(); foliage.position.y = .48 * scale; plantRoot.add(foliage);
      var count = lowfx ? 8 : 13, geo = leafGeometry(.95 * scale, .19 * scale, .2 * scale, 10);
      var leaves = new THREE.InstancedMesh(geo, material(foliageColor || '#779579', { side: THREE.DoubleSide, roughness: .86 }), count);
      leaves.castShadow = !lowfx; leaves.receiveShadow = !lowfx;
      for (var i = 0; i < count; i++) {
        var a = i * 2.39996;
        unitDummy.position.set(Math.cos(a) * .04 * scale, (i % 4) * .12 * scale, Math.sin(a) * .04 * scale);
        unitDummy.rotation.set(Math.sin(a) * .45, a, Math.cos(a) * .65);
        unitDummy.scale.setScalar(.65 + (i % 3) * .18); unitDummy.updateMatrix(); leaves.setMatrixAt(i, unitDummy.matrix);
        leaves.setColorAt(i, new THREE.Color(foliageColor || '#779579').multiplyScalar(.85 + (i % 4) * .065));
      }
      foliage.add(leaves); animated.push({ object: foliage, axis: 'z', amount: .025, offset: x * 1.7 });
      return plantRoot;
    }
    function bowl(parent, x, y, z, color, scale) {
      var group = new THREE.Group(); group.position.set(x, y, z); group.scale.setScalar(scale || 1); parent.add(group);
      var outline = [new THREE.Vector2(.2, 0), new THREE.Vector2(.38, .02), new THREE.Vector2(.46, .15), new THREE.Vector2(.48, .27), new THREE.Vector2(.42, .28), new THREE.Vector2(.37, .13), new THREE.Vector2(.21, .1)];
      mesh(new THREE.LatheGeometry(outline, lowfx ? 20 : 32), material(color, { roughness: .38, side: THREE.DoubleSide }), group);
      var food = mesh(new THREE.CircleGeometry(.32, 24), material('#a2784d', { roughness: 1 }), group, 0, .125, 0); food.rotation.x = -Math.PI / 2;
      var kibble = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(.038, 0), material('#ad895c'), lowfx ? 10 : 24);
      for (var k = 0; k < kibble.count; k++) {
        var an = k * 2.399, r = .27 * Math.sqrt((k + .5) / kibble.count);
        unitDummy.position.set(Math.cos(an) * r, .16, Math.sin(an) * r); unitDummy.rotation.set(k, k * 2, k * .4); unitDummy.scale.setScalar(.8 + (k % 3) * .12); unitDummy.updateMatrix(); kibble.setMatrixAt(k, unitDummy.matrix);
      }
      group.add(kibble); return group;
    }
    function archCurve(cx, y, z, halfWidth, straight, radius, mat, parent) {
      var p = [];
      p.push([cx - halfWidth, y, z], [cx - halfWidth, y + straight, z]);
      for (var i = 1; i < 25; i++) { var a = Math.PI - i / 24 * Math.PI; p.push([cx + Math.cos(a) * halfWidth, y + straight + Math.sin(a) * halfWidth, z]); }
      p.push([cx + halfWidth, y, z]);
      return curvedTube(p, radius, mat, parent, lowfx ? 40 : 72);
    }
    function skyPlane(parent, color, x, y, z, width, height) {
      var skyMat = material(color, { roughness: 1, emissive: color, emissiveIntensity: .15 });
      skyMaterials.push({ material: skyMat, day: new THREE.Color(color), night: new THREE.Color('#344c5a') });
      return mesh(new THREE.PlaneGeometry(width, height), skyMat, parent, x, y, z);
    }
    function roundFloor(color, radius) {
      var floor = mesh(new THREE.CylinderGeometry(radius, radius, .12, lowfx ? 48 : 80), material(color), root, 0, -.075, 0);
      floor.castShadow = false; return floor;
    }

    var home, foodAt, sleepAt, bounds, camera, background, fog;
    if (species === 'cat') {
      background = '#e4e9de'; fog = '#e4e9de';
      home = new THREE.Vector3(0, 0, .6); foodAt = new THREE.Vector3(1.65, 0, -.65); sleepAt = new THREE.Vector3(-1.65, 0, -.6);
      bounds = { x: 1.7, z: 1.15, yMin: 0, yMax: 0 };
      camera = { position: [0, 3.7, 8.8], target: [0, 1.35, 0] };
      roundFloor('#d7c8ae', 4.9);
      var planks = new THREE.InstancedMesh(new THREE.BoxGeometry(8.9, .075, .47), material('#ead8bd', { map: woodTexture, roughness: .82 }), 17);
      for (var q = 0; q < 17; q++) {
        var zz = (q - 8) * .49, half = Math.sqrt(Math.max(.1, 4.65 * 4.65 - zz * zz));
        unitDummy.position.set(0, -.015, zz); unitDummy.rotation.set(0, 0, 0); unitDummy.scale.set(half * 2 / 8.9, 1, 1); unitDummy.updateMatrix(); planks.setMatrixAt(q, unitDummy.matrix);
        planks.setColorAt(q, new THREE.Color('#f3e5cf').multiplyScalar(.9 + (q % 4) * .025));
      }
      planks.receiveShadow = !lowfx; root.add(planks);
      var rug = mesh(new THREE.CylinderGeometry(2.1, 2.1, .025, 64), material('#e8e9d8', { roughness: 1 }), root, 0, .035, .3); rug.scale.z = .7; rug.castShadow = false;
      var rugEdge = mesh(new THREE.TorusGeometry(2.08, .018, 4, 64), material('#c6ceb6'), root, 0, .054, .3); rugEdge.rotation.x = -Math.PI / 2; rugEdge.scale.y = .7;
      // The arch is a genuine wall opening, with a pale view behind it.
      var wall = new THREE.Shape(); wall.moveTo(-5, 0); wall.lineTo(5, 0); wall.lineTo(5, 5.4); wall.lineTo(-5, 5.4); wall.closePath();
      var opening = new THREE.Path(); opening.moveTo(-1.3, .9); opening.lineTo(-1.3, 3.05); opening.absarc(0, 3.05, 1.3, Math.PI, 0, true); opening.lineTo(1.3, .9); opening.closePath(); wall.holes.push(opening);
      var wallMesh = mesh(new THREE.ExtrudeGeometry(wall, { depth: .13, bevelEnabled: false, curveSegments: 32 }), material('#d8dfcb'), root, 0, 0, -2.7);
      wallMesh.castShadow = false;
      skyPlane(root, '#c8dedb', 0, 2.6, -2.92, 2.9, 3.8);
      archCurve(0, .86, -2.52, 1.34, 2.17, .055, material('#f3eddb'), root);
      mesh(new THREE.BoxGeometry(2.85, .13, .48), material('#efeadb', { roughness: .65 }), root, 0, .86, -2.48);
      mesh(new THREE.BoxGeometry(.045, 3.36, .07), material('#efe9d7'), root, 0, 2.54, -2.56);
      mesh(new THREE.BoxGeometry(2.58, .045, .07), material('#efe9d7'), root, 0, 2.61, -2.56);
      mesh(new THREE.BoxGeometry(9.8, .19, .15), material('#b8c5ab'), root, 0, .1, -2.49);
      // A quiet patch of afternoon sunlight, independent of shadow-map quality.
      var sunlight = mesh(new THREE.PlaneGeometry(2.4, 2.6), new THREE.MeshBasicMaterial({ color: '#fff5d3', transparent: true, opacity: .15, depthWrite: false }), root, .4, .06, -.45);
      sunlight.rotation.x = -Math.PI / 2; sunlight.rotation.z = -.33; sunlight.castShadow = false;
      var bed = new THREE.Group(); bed.position.set(-1.8, .2, -.8); bed.rotation.y = .2; root.add(bed);
      var bedMat = material('#b8cba4', { map: fabricTexture, bumpMap: fabricTexture, bumpScale: .018, roughness: 1 });
      var bedRim = mesh(new THREE.TorusGeometry(.8, .23, 12, 48), bedMat, bed, 0, .05, 0); bedRim.rotation.x = Math.PI / 2; bedRim.scale.y = .82;
      var cushion = mesh(new THREE.SphereGeometry(.83, 32, 16), material('#eee6cf', { bumpMap: fabricTexture, bumpScale: .012, roughness: 1 }), bed, 0, -.03, 0); cushion.scale.set(1, .16, .82);
      var cushionSeam = mesh(new THREE.TorusGeometry(.69, .012, 4, 48), material('#c5bda8'), bed, 0, .09, 0); cushionSeam.rotation.x = -Math.PI / 2; cushionSeam.scale.y = .82;
      bowl(root, 1.65, .04, .4, '#b98f76', .9);
      plant(root, 2.72, 0, -1.88, 1.2, '#76967b', '#d4b99b');
      plant(root, -2.75, 0, -2.0, 1.6, '#66876b', '#e1c9aa');
      toy = new THREE.Group(); toy.position.set(1.35, .19, 1.5); root.add(toy);
      var yarnMat = material('#a8bcb5', { roughness: 1 });
      mesh(new THREE.SphereGeometry(.19, 24, 16), yarnMat, toy);
      var yarnLines = new THREE.Group(); toy.add(yarnLines);
      for (var yl = 0; yl < 4; yl++) {
        var thread = mesh(new THREE.TorusGeometry(.191, .006, 3, 32), material(yl % 2 ? '#819f94' : '#c5d4ca'), yarnLines); thread.rotation.set(yl * .7, yl * .8, yl * .5);
      }
      curvedTube([[1.35, .035, 1.5], [1.6, .035, 1.65], [1.85, .035, 1.5], [2.15, .035, 1.7]], .009, yarnMat, root, 24);
    } else if (species === 'bird') {
      background = '#e2ece0'; fog = '#e2ece0';
      home = new THREE.Vector3(0, 1.12, .15); foodAt = new THREE.Vector3(1.55, 1.12, -.65); sleepAt = new THREE.Vector3(-1.3, 1.12, -.15);
      bounds = { x: 1.7, z: .75, yMin: 1.12, yMax: 2.6 };
      camera = { position: [0, 4.1, 9.2], target: [0, 2.1, 0] };
      roundFloor('#d0ddbd', 4.7);
      var platform = mesh(new THREE.CylinderGeometry(2.7, 2.8, .13, 64), material('#e8dfc8', { map: woodTexture }), root, 0, .02, 0); platform.scale.z = .68;
      var bark = material('#c9b798', { map: woodTexture, roughness: .95 });
      curvedTube([[-1.2, .1, -.5], [-.9, .4, -.55], [-.7, .85, -.48], [-.3, 1.0, -.28], [.5, 1.03, -.12], [2.1, 1.03, -.2]], .12, bark, root, 45);
      curvedTube([[-.8, .55, -.52], [-1.5, .9, -.48], [-2.2, 1.1, -.35]], .075, bark, root, 24);
      curvedTube([[-.55, .86, -.3], [-.6, 1.01, -.1], [.0, 1.03, .16], [1.55, 1.04, .15]], .09, bark, root, 32);
      curvedTube([[-.8, .48, -.56], [-1.25, 1.5, -1.25], [-1.4, 2.8, -1.45], [-.6, 4.35, -1.8]], .085, bark, root, 42);
      curvedTube([[-1.35, 2.5, -1.4], [-2.15, 3.0, -1.5], [-2.65, 3.6, -1.6]], .05, bark, root, 28);
      var canopyGeo = leafGeometry(.9, .23, .17, 10), canopyMat = material('#82a27b', { side: THREE.DoubleSide, roughness: .86 });
      var canopy = new THREE.Group(); root.add(canopy);
      var foliageCount = lowfx ? 16 : 28, canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, foliageCount);
      for (var lf = 0; lf < foliageCount; lf++) {
        var left = lf < foliageCount * .48, yy = 2.25 + (lf % 9) * .22;
        unitDummy.position.set(left ? -1.65 - random() * .6 : -.9 + random() * .6, yy, -1.45 + random() * .2);
        unitDummy.rotation.set((random() - .5) * .7, random() * 6.28, (left ? .4 : -.5) + random() * .6);
        unitDummy.scale.setScalar(.7 + random() * .45); unitDummy.updateMatrix(); canopyMesh.setMatrixAt(lf, unitDummy.matrix);
        canopyMesh.setColorAt(lf, new THREE.Color('#85a67b').multiplyScalar(.82 + random() * .28));
      }
      canopyMesh.castShadow = !lowfx; canopy.add(canopyMesh); animated.push({ object: canopy, axis: 'z', amount: .008, offset: 2.1 });
      bowl(root, 1.55, .93, .15, '#e9c77c', .65);
      // A ring and bell are play objects, with an open centre for the bird.
      var rope = material('#c8b28a');
      curvedTube([[1.95, 4.5, -1.15], [1.95, 3.5, -1.15], [1.95, 3.1, -1.15]], .013, rope, root, 12);
      var ringGroup = new THREE.Group(); ringGroup.position.set(1.95, 2.65, -1.15); root.add(ringGroup);
      mesh(new THREE.TorusGeometry(.48, .045, 8, 48), material('#d9bb88', { roughness: .9 }), ringGroup);
      animated.push({ object: ringGroup, axis: 'z', amount: .035, offset: .4 });
      var bellGroup = new THREE.Group(); bellGroup.position.set(-1.8, 1.12, -.3); root.add(bellGroup); toy = bellGroup;
      curvedTube([[0, 0, 0], [0, -.18, 0], [0, -.32, 0]], .009, rope, bellGroup, 5);
      var bellProfile = [new THREE.Vector2(.02, .12), new THREE.Vector2(.1, .08), new THREE.Vector2(.12, -.07), new THREE.Vector2(.18, -.17), new THREE.Vector2(.17, -.2)];
      mesh(new THREE.LatheGeometry(bellProfile, 24), material('#d9af58', { metalness: .6, roughness: .28, side: THREE.DoubleSide }), bellGroup, 0, -.4, 0);
      mesh(new THREE.SphereGeometry(.035, 12, 8), material('#a67f37', { metalness: .5, roughness: .3 }), bellGroup, 0, -.61, 0);
      plant(root, 2.65, 0, -1.75, 1.3, '#779b76', '#d4b69a');
      plant(root, -2.6, 0, -1.5, .8, '#94ac7b', '#d5c6a6');
      // Garden backdrop, shaped to read as an airy open conservatory.
      skyPlane(root, '#d8e7db', 0, 3, -3.0, 10, 6);
      archCurve(0, .1, -2.8, 3.3, 2.35, .075, material('#e9e5d4'), root);
      mesh(new THREE.BoxGeometry(.06, 4.9, .06), material('#e9e5d4'), root, 0, 2.55, -2.78);
    } else {
      background = '#b6d9d6'; fog = '#b6d9d6';
      home = new THREE.Vector3(0, 1.9, .35); foodAt = new THREE.Vector3(1.35, 2.9, .3); sleepAt = new THREE.Vector3(-1.3, 1.2, -.75);
      bounds = { x: 1.8, z: 1.05, yMin: 1, yMax: 3 };
      camera = { position: [0, 3.25, 8.7], target: [0, 1.8, 0] };
      var sandTexture = canvasTexture(256, 256, function (ctx, w, h) {
        ctx.fillStyle = '#e5d5af'; ctx.fillRect(0, 0, w, h);
        for (var s = 0; s < 5000; s++) { ctx.fillStyle = s % 2 ? 'rgba(112,101,71,.12)' : 'rgba(255,252,221,.35)'; var sz = .3 + random(); ctx.fillRect(random() * w, random() * h, sz, sz); }
      }, [2, 2]);
      var sand = mesh(new THREE.CylinderGeometry(3.7, 3.8, .18, 80), material('#e9ddbd', { map: sandTexture, roughness: 1 }), root, 0, -.05, 0); sand.scale.z = .77;
      var bottomRim = mesh(new THREE.TorusGeometry(3.72, .035, 5, 80), material('#a7bfaf', { roughness: .3, metalness: .15 }), root, 0, -.015, 0); bottomRim.rotation.x = -Math.PI / 2; bottomRim.scale.y = .77;
      skyPlane(root, '#abd2ce', 0, 2.7, -3.0, 9, 5.5);
      var rockTexture = canvasTexture(128, 128, function (ctx, w, h) {
        ctx.fillStyle = '#b7b9a1'; ctx.fillRect(0, 0, w, h);
        for (var k = 0; k < 1800; k++) { var vv = random(); ctx.fillStyle = vv > .5 ? 'rgba(65,88,76,.06)' : 'rgba(244,242,219,.12)'; ctx.beginPath(); ctx.arc(random() * w, random() * h, .3 + random() * 3, 0, Math.PI * 2); ctx.fill(); }
      });
      var stone = material('#b9bca5', { map: rockTexture, bumpMap: rockTexture, bumpScale: .035, roughness: .95 });
      var shelter = mesh(new THREE.TorusGeometry(.82, .27, 10, 36, Math.PI), stone, root, -1.35, .19, -1.35); shelter.scale.set(1, 1.1, .9); shelter.rotation.y = -.15;
      var rockGeo = new THREE.IcosahedronGeometry(.45, 2), rockInst = new THREE.InstancedMesh(rockGeo, stone, 6);
      for (var rk = 0; rk < 6; rk++) {
        unitDummy.position.set(rk < 3 ? -2.1 + rk * .48 : 1.85 + (rk - 3) * .22, .14 + (rk % 2) * .08, rk < 3 ? -1.4 : -.95);
        unitDummy.rotation.set(rk * .8, rk * .7, rk * .45); unitDummy.scale.set(.75 + (rk % 3) * .2, .55 + (rk % 2) * .3, .8); unitDummy.updateMatrix(); rockInst.setMatrixAt(rk, unitDummy.matrix);
      }
      rockInst.castShadow = !lowfx; rockInst.receiveShadow = !lowfx; root.add(rockInst);
      // Continuous ribbon leaves flex in the water; there are no linked spheres.
      var grassTime = { value: 0 }; timeUniforms.push(grassTime);
      var grassMat = material('#5b9887', { side: THREE.DoubleSide, roughness: .7 });
      grassMat.onBeforeCompile = function (shader) {
        shader.uniforms.uHabitatTime = grassTime;
        shader.vertexShader = 'uniform float uHabitatTime;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed.x += sin(position.y * 2.1 + uHabitatTime * 0.8) * 0.10 * uv.y * uv.y;\n transformed.z += cos(position.y * 1.3 + uHabitatTime * 0.65) * 0.06 * uv.y;');
      };
      var grassCount = lowfx ? 12 : 22, grass = new THREE.InstancedMesh(leafGeometry(1.7, .15, .23, 12), grassMat, grassCount);
      for (var gr = 0; gr < grassCount; gr++) {
        var side = gr % 2 ? -1 : 1;
        unitDummy.position.set(side * (2.1 + random() * .55), .02, -.75 - random() * 1.15);
        unitDummy.rotation.set((random() - .5) * .28, random() * 6.28, side * (.08 + random() * .28));
        unitDummy.scale.set(.6 + random() * .65, .5 + random() * .9, .7 + random() * .4); unitDummy.updateMatrix(); grass.setMatrixAt(gr, unitDummy.matrix);
        grass.setColorAt(gr, new THREE.Color(gr % 3 ? '#5f9b87' : '#91b190').multiplyScalar(.85 + random() * .2));
      }
      grass.castShadow = !lowfx; root.add(grass);
      var broadGrass = new THREE.InstancedMesh(leafGeometry(1.1, .24, .32, 10), material('#87b6a5', { side: THREE.DoubleSide, roughness: .8 }), 9);
      for (var bg = 0; bg < 9; bg++) {
        unitDummy.position.set(1.95 + random() * .5, .01, -.15 - random() * .5); unitDummy.rotation.set(.2, bg * 2.4, -.3 - random() * .3); unitDummy.scale.setScalar(.7 + random() * .3); unitDummy.updateMatrix(); broadGrass.setMatrixAt(bg, unitDummy.matrix);
      }
      root.add(broadGrass);
      var coralMat = material('#d0a79a', { roughness: .87 });
      curvedTube([[1.7, .08, 1], [1.75, .45, 1], [1.62, .8, .98], [1.68, 1.02, .97]], .058, coralMat, root, 22);
      curvedTube([[1.75, .4, 1], [1.98, .58, .97], [2.04, .86, .96]], .046, coralMat, root, 16);
      curvedTube([[1.72, .6, .99], [1.42, .72, 1.0], [1.35, .94, 1.02]], .04, coralMat, root, 16);
      var shell = mesh(new THREE.SphereGeometry(.28, 24, 12, 0, Math.PI * 2, 0, Math.PI * .55), material('#f2e4cb', { roughness: .43, side: THREE.DoubleSide }), root, -.9, .04, 1.4); shell.scale.set(1.3, .42, 1); shell.rotation.z = .2;
      // The floor light is a texture of intersecting caustic paths, not an emissive glow.
      var causticTexture = canvasTexture(256, 256, function (ctx, w, h) {
        ctx.clearRect(0, 0, w, h); ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(255,255,226,.7)';
        for (var cl = -2; cl < 9; cl++) {
          ctx.beginPath(); for (var px = -10; px <= 266; px += 3) { var py = cl * 42 + Math.sin(px * .028 + cl * 1.3) * 16 + Math.cos(px * .059 + cl) * 7; if (px === -10) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke();
          ctx.beginPath(); for (var py2 = -10; py2 <= 266; py2 += 3) { var px2 = cl * 40 + Math.sin(py2 * .027 + cl * 1.7) * 17; if (py2 === -10) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2); } ctx.stroke();
        }
      }, [3, 2]);
      var causticPlane = mesh(new THREE.CircleGeometry(3.65, 64), new THREE.MeshBasicMaterial({ color: '#fffce9', map: causticTexture, transparent: true, opacity: .22, depthWrite: false, blending: THREE.AdditiveBlending }), root, 0, .047, 0); causticPlane.rotation.x = -Math.PI / 2; causticPlane.scale.y = .77; causticPlane.castShadow = false;
      animated.push({ texture: causticTexture });
      // Narrow glass rims suggest the aquarium without covering the character.
      var glassMat = new THREE.MeshPhysicalMaterial({ color: '#e2f5ed', roughness: .12, metalness: .0, transparent: true, opacity: .18, depthWrite: false, clearcoat: 1 });
      var topRim = mesh(new THREE.TorusGeometry(3.68, .018, 5, 80), glassMat, root, 0, 4.1, 0); topRim.rotation.x = -Math.PI / 2; topRim.scale.y = .77;
      for (var edge = -1; edge <= 1; edge += 2) { var rod = mesh(new THREE.CylinderGeometry(.018, .018, 4.1, 6), glassMat, root, edge * 3.66, 2.05, 0); rod.castShadow = false; }
      var bubbleCount = lowfx ? 8 : 16;
      bubbleMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshPhysicalMaterial({ color: '#ebfff6', roughness: .08, metalness: .05, transparent: true, opacity: .25, depthWrite: false, clearcoat: 1 }), bubbleCount);
      for (var bu = 0; bu < bubbleCount; bu++) bubbleData.push({ x: -2.5 + random() * 5, z: -1.6 + random() * .6, phase: random() * 4.2, size: .025 + random() * .045, speed: .17 + random() * .2 });
      root.add(bubbleMesh);
      toy = new THREE.Object3D(); toy.position.set(1.7, .3, -.8); root.add(toy);
    }

    function update(t, dt, night) {
      var n = Math.max(0, Math.min(1, Number(night) || 0));
      for (var i = 0; i < animated.length; i++) {
        var a = animated[i];
        if (a.texture) { a.texture.offset.set(Math.sin(t * .08) * .08, t * .012 % 1); }
        else a.object.rotation[a.axis] = Math.sin(t * .65 + a.offset) * a.amount;
      }
      for (var u = 0; u < timeUniforms.length; u++) timeUniforms[u].value = t;
      for (var s = 0; s < skyMaterials.length; s++) { var sky = skyMaterials[s]; sky.material.color.copy(sky.day).lerp(sky.night, n * .8); sky.material.emissive.copy(sky.material.color); }
      if (bubbleMesh) {
        for (var b = 0; b < bubbleData.length; b++) {
          var v = bubbleData[b], yy = (v.phase + t * v.speed) % 4.1;
          unitDummy.position.set(v.x + Math.sin(t * .7 + b) * .08, yy, v.z); unitDummy.rotation.set(0, 0, 0);
          unitDummy.scale.setScalar(v.size * Math.min(1, yy * 3) * Math.min(1, (4.1 - yy) * 3)); unitDummy.updateMatrix(); bubbleMesh.setMatrixAt(b, unitDummy.matrix);
        }
        bubbleMesh.instanceMatrix.needsUpdate = true;
      }
    }
    update(0, 0, 0);
    return { root: root, home: home, bowl: foodAt, sleep: sleepAt, bounds: bounds, toy: toy, camera: camera, background: background, fog: fog, update: update };
  };
})(window);


/* Astra VPet 2 — original procedural pet playground, Three.js r159. */
(function () {
  'use strict';
  var THREE = window.THREE, Art = window.VPetArt;
  var SPECIES = ['cat', 'bird', 'fish'];
  var DEFAULTS = {
    cat: {body:'#e9a35c',accent:'#fff3de',eye:'#779c77',pattern:'stripes',acc:'none'},
    bird:{body:'#91bda0',accent:'#fff1c9',eye:'#543c29',pattern:'solid',acc:'none'},
    fish:{body:'#ef964e',accent:'#fff1d5',eye:'#445d68',pattern:'patch',acc:'none'}
  };
    var ICONS = {
    surprise:'<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4L12 3Z"/>',
    feed:'<path d="M4 10h16l-2 7H6l-2-7Zm3 10h10M8 4v3m4-4v4m4-3v3"/>',
    play:'<circle cx="12" cy="12" r="8"/><path d="M6 6c8 1 11 4 12 12M6 18C7 10 10 7 18 6"/>',
    pet:'<path d="M7 12V7a1.5 1.5 0 0 1 3 0v4-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v6c0 4-3 6-6 6h-1c-2 0-4-1-5-3l-3-4c-1-2 1-3 2-2l3 3"/>',
    bath:'<path d="M4 12h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-3Zm2 0V5a3 3 0 0 1 6 0M3 12h18M7 21v1m10-1v1"/><circle cx="16" cy="7" r="2"/>',
    sleep:'<path d="M19 15A8 8 0 0 1 9 4a8 8 0 1 0 10 11Z"/><path d="M16 3v4m-2-2h4"/>',
    wake:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
    custom:'<path d="m5 19 1-5L17 3l4 4L10 18l-5 1ZM14 6l4 4M3 22h18"/>',
    kiss:'<path d="M12 20S3 15 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 11-9 11Z"/>',
    camera:'<path d="M3 7h4l2-3h6l2 3h4v14H3V7Z"/><circle cx="12" cy="13" r="4"/>',
    sound:'<path d="M3 9h4l5-4v14l-5-4H3V9Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="M3 9h4l5-4v14l-5-4H3V9Zm13 0 6 6m0-6-6 6"/>',
    move:'<path d="M12 3v18M3 12h18m-12-6 3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3m12-6 3 3-3 3"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    paw:'<ellipse cx="12" cy="15.5" rx="5.2" ry="4.2"/><ellipse cx="5" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5.5" rx="2" ry="3"/><ellipse cx="16" cy="6" rx="2" ry="3"/><ellipse cx="20" cy="10" rx="1.7" ry="2.5"/>'
  };
  function icon(n){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[n]||ICONS.paw)+'</svg>';}
  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
  function finite(x,d){return typeof x==='number' && isFinite(x)?x:d;}
  function ease(a,b,dt,k){return a+(b-a)*(1-Math.exp(-dt*k));}
  function safeColor(x,d){return typeof x==='string' && /^#[0-9a-f]{6}$/i.test(x)?x:d;}
  function disposeTree(root){
    var gs=new Set(), ms=new Set(), ts=new Set();
    root.traverse(function(o){if(o.geometry)gs.add(o.geometry); if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(function(m){ms.add(m);});});
    ms.forEach(function(m){Object.keys(m).forEach(function(k){if(m[k]&&m[k].isTexture)ts.add(m[k]);}); if(m.userData&&m.userData.textures)m.userData.textures.forEach(function(t){ts.add(t);}); m.dispose();});
    gs.forEach(function(g){g.dispose();}); ts.forEach(function(t){t.dispose();});
  }
  function style(){return `
.vp2{--vp-ink:#263a32;--vp-muted:#516158;--vp-paper:#fbfcf7;--vp-line:#dce3d9;--vp-accent:#3d6b50;position:absolute;inset:0;overflow:hidden;isolation:isolate;font:14px 'Trebuchet MS',Arial,sans-serif;color:var(--vp-ink);user-select:none;-webkit-user-select:none;touch-action:none;background:#dce5d8}
.vp2 *{box-sizing:border-box}.vp2 button,.vp2 input,.vp2 select{font:inherit;color:inherit}.vp2 button{cursor:pointer;-webkit-tap-highlight-color:transparent}.vp2 button:focus-visible,.vp2 input:focus-visible,.vp2 select:focus-visible{outline:3px solid #507b55;outline-offset:3px}.vp2 button:active{transform:scale(.96)}.vp2 button:disabled{opacity:.65;cursor:default}.vp2 svg{width:22px;height:22px;display:block}.vp2 canvas.vp2-scene{position:absolute;inset:0;width:100%;height:100%;outline:none;touch-action:none}.vp2-top{position:absolute;left:20px;right:20px;top:18px;pointer-events:none}.vp2-title{display:flex;align-items:center;gap:10px}.vp2-name{font-size:24px;font-weight:700;letter-spacing:-.7px;line-height:1.15}.vp2-level{border-left:1px solid #9eafa0;padding-left:10px;font-size:12px}.vp2-status{margin-top:5px;font-size:12px;color:var(--vp-muted);min-height:15px}.vp2-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:420px;margin-top:15px}.vp2-stat{min-width:0}.vp2-stat-label{display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px;gap:3px}.vp2-stat-label b{font-weight:400;font-variant-numeric:tabular-nums}.vp2-track{height:4px;background:#afbeac;border-radius:4px;overflow:hidden}.vp2-fill{height:100%;background:#456e4d;transition:width .7s;border-radius:4px}.vp2-utilities{position:absolute;right:14px;top:123px;display:grid;gap:6px}.vp2-utility{height:44px;width:44px;display:grid;place-items:center;border:1px solid var(--vp-line);border-radius:50%;background:var(--vp-paper)}.vp2-utility[aria-pressed=true]{background:#294b38;color:white;border-color:#294b38}.vp2-tools{position:absolute;left:14px;top:125px;display:flex;align-items:flex-start;gap:7px;flex-direction:column}.vp2-kiss{width:auto;padding:0 13px;display:flex;gap:7px;font-size:12px}.vp2-kiss svg{width:17px}.vp2-bottom{position:absolute;left:14px;right:14px;bottom:14px;pointer-events:none}.vp2-hint{text-align:center;min-height:17px;font-size:11px;color:#354d3d;margin:0 0 12px;pointer-events:none}.vp2-actions{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;pointer-events:auto;padding:9px 4px 7px;background:var(--vp-paper);border:1px solid var(--vp-line);border-radius:20px}.vp2-actions button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-width:0;min-height:56px;border:0;background:transparent;border-radius:12px;font-size:11px}.vp2-actions button:hover{background:#edf1e9}.vp2-actions button[aria-pressed=true]{background:#e3ecdf}.vp2-speech{position:absolute;max-width:220px;left:50%;top:35%;padding:10px 14px;border-radius:16px 16px 16px 3px;background:var(--vp-paper);border:1px solid var(--vp-line);font-size:13px;pointer-events:none;opacity:0;transition:opacity .25s;transform:translate(-50%,-100%);text-align:center;z-index:3}.vp2-speech.show{opacity:1}.vp2-sheet{position:absolute;left:12px;right:12px;bottom:12px;max-height:calc(100% - 100px);overflow:auto;padding:22px;border:1px solid var(--vp-line);border-radius:22px;background:var(--vp-paper);z-index:7;box-shadow:0 12px 40px #142c3522;touch-action:pan-y;display:none}.vp2-sheet.open{display:block}.vp2-sheet h2{font-size:20px;margin:0 40px 8px 0;letter-spacing:-.4px}.vp2-sheet p{color:var(--vp-muted);font-size:13px;line-height:1.55;margin:0 0 18px}.vp2-sheet-close{position:absolute;top:12px;right:12px;background:transparent;border:0;height:44px;width:44px;display:grid;place-items:center}.vp2-sheet label{font-size:12px;display:block;margin:16px 0 8px}.vp2-sheet input[type=text],.vp2-sheet select{width:100%;height:44px;background:white;border:1px solid #c4d1c2;border-radius:9px;padding:10px}.vp2-sheet input[type=color]{width:44px;height:44px;border:1px solid #c4d1c2;background:transparent;border-radius:50%;padding:4px}.vp2-row{display:flex;gap:8px;flex-wrap:wrap}.vp2-choice{border:1px solid #c4d1c2;border-radius:10px;background:white;padding:12px;min-height:48px;flex:1;min-width:90px}.vp2-choice.selected{outline:2px solid #42674c;outline-offset:-2px;background:#eaf0e4}.vp2-primary{width:100%;padding:13px;margin-top:20px;border:0;border-radius:12px;background:#294b38;color:white!important;min-height:46px}.vp2-colors{display:flex;gap:18px;align-items:end}.vp2-colors label{margin-top:12px}.vp2-joy{position:absolute;pointer-events:none;color:#b66b68;font-size:24px;z-index:4;animation:vp2-float 1.5s ease-out forwards}.vp2-ripple{position:absolute;width:24px;height:24px;margin:-12px;border:2px solid #ffffffb0;border-radius:50%;pointer-events:none;animation:vp2-ripple .85s ease-out forwards;z-index:2}.vp2-glass-kiss{position:absolute;width:62px;height:42px;border-radius:50%;border:4px solid #c67c7888;transform:translate(-50%,-50%) rotate(-16deg);pointer-events:none;z-index:2;animation:vp2-kiss 3s forwards}.vp2-glass-kiss:after{content:'';position:absolute;inset:7px 0;border-top:2px solid #c67c7888;border-bottom:2px solid #c67c7888;border-radius:50%}.vp2-pad{position:absolute;bottom:122px;left:20px;width:100px;height:100px;border-radius:50%;background:#f6f9f0d9;border:1px solid #b2c2b0;display:none;touch-action:none}.vp2-pad.visible{display:block}.vp2-stick{position:absolute;left:29px;top:29px;width:40px;height:40px;background:#4b7054;border:5px solid #f5f9ef;border-radius:50%;pointer-events:none}.vp2-error{position:absolute;inset:20px;display:grid;place-content:center;text-align:center;line-height:1.6}.vp2.compact .vp2-actions button span{display:none}.vp2.compact .vp2-actions button{min-height:44px}.vp2.compact .vp2-top{top:12px;left:14px;right:14px}.vp2.compact .vp2-stats{margin-top:10px}.vp2.compact .vp2-utilities{top:110px}.vp2.compact .vp2-tools{top:110px}.vp2.compact .vp2-hint{display:none}
@keyframes vp2-float{0%{opacity:0;transform:translate(-50%,0) scale(.7)}20%{opacity:1}100%{opacity:0;transform:translate(-50%,-90px) scale(1.2)}}@keyframes vp2-ripple{to{transform:scale(6);opacity:0}}@keyframes vp2-kiss{0%{opacity:0}15%,60%{opacity:1}100%{opacity:0}}
@media(max-width:420px){.vp2-top{left:16px;right:16px}.vp2-stats{gap:9px}.vp2-name{font-size:22px}.vp2-bottom{left:10px;right:10px;bottom:10px}.vp2-kiss{padding:0 10px}.vp2-actions{gap:1px}.vp2-hint{font-size:11px}.vp2-sheet{padding:18px}}
@media(prefers-reduced-motion:reduce){.vp2 *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;}
  window.VPet={version:'2.0.0',species:SPECIES.slice(),mount:function(host,opts){
    opts=opts||{}; var T=opts.T||function(ms,en){return en;}, st=opts.state&&typeof opts.state==='object'?opts.state:{}, lowfx=!!opts.lowfx;
    if(!host||!host.appendChild)throw new Error('VPet.mount needs a host element');
    var now=Date.now(), sp=SPECIES.indexOf(st.sp)>=0?st.sp:'cat';st.sp=sp;
    st.n=typeof st.n==='string'&&st.n.trim()?st.n.slice(0,24):({cat:'Mochi',bird:'Pip',fish:'Bubbles'})[sp];
    st.born=finite(st.born,now);st.xp=Math.max(0,finite(st.xp,0));st.sleeping=!!st.sleeping;st.mute=!!st.mute;
    st.personality=['curious','playful','dreamy'].indexOf(st.personality)>=0?st.personality:'curious';
    st.s=st.s&&typeof st.s==='object'?st.s:{};
    ['hunger','joy','energy','clean','health'].forEach(function(k){st.s[k]=clamp(finite(st.s[k],k==='health'?100:85),5,100);});
    st.look=st.look&&typeof st.look==='object'?st.look:{};
    ['body','accent','eye'].forEach(function(k){st.look[k]=safeColor(st.look[k],DEFAULTS[sp][k]);});
    st.look.pattern=['solid','stripes','spots','patch'].indexOf(st.look.pattern)>=0?st.look.pattern:DEFAULTS[sp].pattern;
    st.look.acc=['none','bow','flower','scarf','cap'].indexOf(st.look.acc)>=0?st.look.acc:'none';
    function drift(h){if(st.sleeping){st.s.energy=clamp(st.s.energy+14*h,5,100);st.s.hunger=clamp(st.s.hunger-2*h,5,100);}else{Object.keys({hunger:6,joy:4,energy:3,clean:2}).forEach(function(k){st.s[k]=clamp(st.s[k]-({hunger:6,joy:4,energy:3,clean:2})[k]*h,5,100);});}st.s.health=clamp(st.s.health+(Math.min(st.s.hunger,st.s.energy,st.s.clean)<20?-2:1)*h,20,100);}
    drift(clamp((now-finite(st.t,now))/36e5,0,24));st.t=now;
    if(st.sleeping&&st.s.energy>=99)st.sleeping=false;
    var alive=true,paused=false,raf=0,elapsed=0,last=0,lastFrame=0,lastSave=now,mode=st.sleeping?'sleep':'idle',phase=0,modeDuration=4,nextIdle=4;
    var walkGoal=null,arrival=null,speed=0,gait=0,happy=0,blink=0,blinkAt=2.1,blinkPhase=0,lookX=0,lookY=0;
    var freeMove=false,pointer=null,holdTime=0,gesturePet=false,pressed={},joyTimers=new Set(),audio=null,removers=[],panelRemovers=[],particleGroup;
    var visual=null,accessory=null,env=null,renderer=null,scene=null,camera=null,nightValue=0,rootScale=1,toyGoal=null,bellKick=0;
    var wrap=document.createElement('div');wrap.className='vp2'+(opts.compact?' compact':'');wrap.setAttribute('data-species',sp);
    var css=document.createElement('style');css.textContent=style();wrap.appendChild(css);host.appendChild(wrap);
    function el(tag,cls,parent,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;(parent||wrap).appendChild(e);return e;}
    function listen(target,event,fn,options){target.addEventListener(event,fn,options);var remove=function(){target.removeEventListener(event,fn,options);};if(sheet&&target.nodeType&&sheet.contains(target)&&target!==sheet)panelRemovers.push(remove);else removers.push(remove);}
    function emit(n,data){if(typeof opts.onEvent==='function')try{opts.onEvent(n,data||{});}catch(e){}if(typeof opts.vib==='function'&&['pet','feed','bath','play','levelup'].indexOf(n)>=0)try{opts.vib(n==='levelup'?35:12);}catch(e){}}
    var driftAt=now;
    function settle(){var t=Date.now();drift(clamp((t-driftAt)/36e5,0,24));driftAt=t;st.t=t;}
    function persist(){settle();lastSave=st.t;if(typeof opts.save==='function')try{opts.save(st);}catch(e){}}
    function later(fn,ms){var id=setTimeout(function(){joyTimers.delete(id);if(alive)fn();},ms);joyTimers.add(id);return id;}
    function level(){return 1+Math.floor(Math.sqrt(st.xp/6));}
    function growXP(n){var before=level();st.xp+=n;if(level()>before){emit('levelup',{level:level()});say(T('Naik tahap!','A little more grown up!'));}}
    function gain(k,n){st.s[k]=clamp(st.s[k]+n,5,100);growXP(Math.max(1,Math.round(n/4)));}
    function button(parent,cls,n,title,fn){var b=el('button',cls,parent);b.type='button';b.innerHTML=icon(n);b.title=title;b.setAttribute('aria-label',title);if(fn)listen(b,'click',fn);return b;}
    function sound(kind){if(st.mute||!alive)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();var o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime,f=sp==='bird'?1900:sp==='fish'?480:540;o.type='sine';o.frequency.setValueAtTime(kind==='purr'?80:f,t);o.frequency.exponentialRampToValueAtTime(kind==='purr'?52:f*.65,t+.22);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.025);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(audio.destination);o.start();o.stop(t+.27);o.onended=function(){o.disconnect();g.disconnect();};}catch(e){}}
    var top=el('div','vp2-top'),title=el('div','vp2-title',top),nameEl=el('span','vp2-name',title,st.n),lvEl=el('span','vp2-level',title),status=el('div','vp2-status',top),stats=el('div','vp2-stats',top),statEls={};
    var labels={hunger:T('Kenyang','Fullness'),joy:T('Gembira','Happiness'),energy:T('Tenaga','Energy'),clean:T('Bersih','Cleanliness')};
    Object.keys(labels).forEach(function(k){var s=el('div','vp2-stat',stats),l=el('div','vp2-stat-label',s);el('span','',l,labels[k]);var num=el('b','',l),track=el('div','vp2-track',s),fill=el('div','vp2-fill',track);track.setAttribute('role','progressbar');track.setAttribute('aria-label',labels[k]);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');statEls[k]={num:num,track:track,fill:fill};});
    var speech=el('div','vp2-speech');speech.setAttribute('role','status');speech.setAttribute('aria-live','polite');var speechTime=0;
    function say(text,seconds){speech.textContent=text;speech.classList.add('show');speechTime=seconds||3.5;}
    var tools=el('div','vp2-tools'),kissBtn=button(tools,'vp2-utility vp2-kiss','kiss',T('Cium kaca','Kiss the glass'),function(){act('kiss');});el('span','',kissBtn,T('Cium','Kiss'));
    var surpriseBtn=button(tools,'vp2-utility vp2-kiss','surprise',T('Kejutan kecil','A little surprise'),function(){act('surprise');});el('span','',surpriseBtn,T('Kejutan','Surprise'));
    var utilities=el('div','vp2-utilities'),muteBtn=button(utilities,'vp2-utility',st.mute?'mute':'sound',T('Bunyi','Sound'),function(){st.mute=!st.mute;muteBtn.innerHTML=icon(st.mute?'mute':'sound');muteBtn.setAttribute('aria-pressed',String(!st.mute));persist();if(!st.mute)sound();});muteBtn.setAttribute('aria-pressed',String(!st.mute));
    var moveBtn=button(utilities,'vp2-utility','move',T('Kawal pergerakan','Move your pet'),function(){freeMove=!freeMove;moveBtn.setAttribute('aria-pressed',String(freeMove));pad.classList.toggle('visible',freeMove);if(freeMove){wake();closePanel();say(T('Gerakkan kayu bedik. Jom!','Use the thumbstick. Let’s go!'));}else{stick.x=stick.y=0;stickEl.style.transform='';setMode('idle',3);}updateUI();});moveBtn.setAttribute('aria-pressed','false');
    button(utilities,'vp2-utility','camera',T('Simpan gambar','Save a photo'),photo);
    var bottom=el('div','vp2-bottom'),hint=el('div','vp2-hint',bottom),actions=el('div','vp2-actions',bottom),actionButtons={};
    [['feed',T('Makan','Feed')],['play',T('Main','Play')],['pet',T('Belai','Pet')],['bath',T('Mandi','Bath')],['sleep',T('Tidur','Sleep')],['custom',T('Gaya','Style')]].forEach(function(a){var b=button(actions,'',a[0],a[1],function(){act(a[0]);});el('span','',b,a[1]);actionButtons[a[0]]=b;});
    var sheet=el('div','vp2-sheet');sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','false');var focusReturn=null;
    function closePanel(){sheet.classList.remove('open');if(focusReturn&&focusReturn.isConnected)focusReturn.focus({preventScroll:true});focusReturn=null;}
    function panel(titleText,desc){focusReturn=document.activeElement;panelRemovers.forEach(function(f){f();});panelRemovers=[];sheet.textContent='';sheet.setAttribute('aria-label',titleText);var c=button(sheet,'vp2-sheet-close','close',T('Tutup','Close'),closePanel);el('h2','',sheet,titleText);if(desc)el('p','',sheet,desc);sheet.classList.add('open');c.focus({preventScroll:true});}
    function chooseFood(){if(st.sleeping)wake();panel(T('Sedikit makanan, banyak kasih','A little food, a lot of love'),T('Pilih hidangan untuk kawan kecil awak.','Pick something for your little friend.'));var row=el('div','vp2-row',sheet),chosen=0,foods=sp==='cat'?[T('Ikan salmon','Salmon bites'),T('Ayam','Chicken'),T('Snek rangup','Crunchy treats')]:sp==='bird'?[T('Biji sekoi','Millet'),T('Epal','Apple'),T('Biji bunga','Sunflower seeds')]:[T('Pelet','Tiny pellets'),T('Kepingan','Fish flakes'),T('Kacang pis','Little peas')];foods.forEach(function(f,i){var b=el('button','vp2-choice'+(!i?' selected':''),row,f);b.type='button';listen(b,'click',function(){chosen=i;Array.from(row.children).forEach(function(x,j){x.classList.toggle('selected',j===i);});});});var go=el('button','vp2-primary',sheet,T('Bismillah · Hidang','Bismillah · Serve'));go.type='button';listen(go,'click',function(){closePanel();goTo(env.bowl,'eat',5);say(T('Bismillah. Sedapnya!','Bismillah. That smells lovely!'));st.lastFood=foods[chosen];emit('feed',{food:chosen});persist();sound();});}
    function custom(){panel(T('Jadikan kawan awak unik','Make a little character'),T('Gaya disimpan terus pada peranti ini.','Your changes are saved as you go.'));var label=el('label','',sheet,T('Nama','Name')),input=el('input','',sheet);input.type='text';input.maxLength=24;input.value=st.n;input.id='vp2-name-'+Math.random().toString(36).slice(2);label.htmlFor=input.id;listen(input,'input',function(){st.n=input.value.trim().slice(0,24)||({cat:'Mochi',bird:'Pip',fish:'Bubbles'})[sp];nameEl.textContent=st.n;persist();});var cols=el('div','vp2-colors',sheet);[['body',T('Warna badan','Coat')],['accent',T('Warna kedua','Accent')],['eye',T('Mata','Eyes')]].forEach(function(a){var box=el('div','',cols),l=el('label','',box,a[1]),i=el('input','',box);i.type='color';i.value=st.look[a[0]];i.setAttribute('aria-label',a[1]);listen(i,'change',function(){st.look[a[0]]=i.value;rebuildPet();persist();});});
      function selectField(labelText,key,values){var l=el('label','',sheet,labelText),s=el('select','',sheet);s.setAttribute('aria-label',labelText);values.forEach(function(v){var o=el('option','',s,v[1]);o.value=v[0];});s.value=key==='personality'?st.personality:st.look[key];listen(s,'change',function(){if(key==='personality')st.personality=s.value;else{st.look[key]=s.value;rebuildPet();}persist();});}
      selectField(T('Corak','Pattern'),'pattern',[['solid',T('Polos','Solid')],['stripes',T('Belang','Stripes')],['spots',T('Bintik','Spots')],['patch',T('Tompok','Patch')]]);
      selectField(T('Aksesori','Accessory'),'acc',[['none',T('Tiada','None')],['bow',T('Reben','Bow')],['flower',T('Bunga','Flower')],['scarf',T('Skaf','Scarf')],['cap',T('Topi','Cap')]]);
      selectField(T('Personaliti','Personality'),'personality',[['curious',T('Ingin tahu','Curious')],['playful',T('Suka bermain','Playful')],['dreamy',T('Santai','Dreamy')]]);
      var done=el('button','vp2-primary',sheet,T('Kembali bermain','Back to our little world'));done.type='button';listen(done,'click',closePanel);
    }
    function updateUI(){nameEl.textContent=st.n;lvEl.textContent=T('Tahap ','Level ')+level();Object.keys(statEls).forEach(function(k){var v=Math.round(st.s[k]),e=statEls[k];e.num.textContent=v+'%';e.fill.style.width=v+'%';e.track.setAttribute('aria-valuenow',String(v));e.fill.style.background=v<25?'#a06b42':'#456e4d';});var b=actionButtons.sleep;b.innerHTML=icon(st.sleeping?'wake':'sleep');el('span','',b,st.sleeping?T('Bangun','Wake'):T('Tidur','Sleep'));b.setAttribute('aria-label',st.sleeping?T('Bangun','Wake'):T('Tidur','Sleep'));b.setAttribute('aria-pressed',String(st.sleeping));actionButtons.pet.setAttribute('aria-pressed',String(gesturePet));hint.textContent=freeMove?T('Kayu bedik untuk gerak · anak panah / WASD juga boleh','Thumbstick to move · arrow keys / WASD work too'):gesturePet?T('Usap kawan kecil awak pada skrin','Stroke your little friend on the screen'):T('Ketik kaca · usap untuk belai · tahan untuk diikuti','Tap the glass · stroke to pet · hold to be followed');var mood=st.sleeping?T('Mimpi indah','Dreaming little dreams'):st.s.energy<25?T('Sedia untuk tidur sebentar','Ready for a little nap'):st.s.hunger<25?T('Teringin sedikit makanan','A little snack would be lovely'):st.s.joy<25?T('Rindu bermain dengan awak','Hoping you’ll play a little'):T('Selesa, ingin tahu & disayangi','Comfy, curious & very loved');status.textContent=mood;}
    function setMode(m,d){mode=m;phase=0;modeDuration=d==null?4:d;nextIdle=modeDuration;}
    function exitManual(){freeMove=false;pressed={};if(stick){stick.x=stick.y=0;stickEl.style.transform='';}if(pad)pad.classList.remove('visible');moveBtn.setAttribute('aria-pressed','false');}
    function goTo(v,then,d){exitManual();walkGoal=v.clone();arrival={mode:then,duration:d};setMode('walk',30);}
    function wake(){settle();st.sleeping=false;walkGoal=null;arrival=null;setMode('yawn',2.5);persist();emit('wake');}
    var lastCare={};
    function act(n){if(!alive||!visual)return;settle();if(n==='custom'){custom();return;}if(n==='feed'){chooseFood();return;}if(n==='wake'){wake();updateUI();return;}if(n==='sleep'){if(st.sleeping){wake();}else{st.sleeping=true;gesturePet=false;goTo(env.sleep,'sleep',Infinity);say(T('Selamat malam, kawan.','Save me a little dream.'));emit('sleep');persist();}updateUI();return;}
      if(st.sleeping)wake();closePanel();gesturePet=false;exitManual();walkGoal=null;arrival=null;
      if(n==='pet'){gesturePet=true;setMode('pet',7);say(T('Usap perlahan. Prrr…','A little stroke. Prrr…'));care('pet','joy',7);sound('purr');}
      else if(n==='play'){var goal=new THREE.Vector3((Math.random()-.5)*env.bounds.x*1.6,sp==='fish'?1.3+Math.random()*1.4:env.home.y,(Math.random()-.5)*env.bounds.z*1.5);if(sp==='cat')toyGoal=goal.clone();if(sp==='bird'){goal.set(-1.55,env.home.y,-.15);bellKick=1;}if(sp==='fish')spawnFoam();goTo(goal,'play',4);if(env.toy)env.toy.visible=true;say(T('Awak tak dapat tangkap saya!','Bet you can’t catch me!'));care('play','joy',16);st.s.energy=clamp(st.s.energy-2,5,100);sound();}
      else if(n==='bath'){walkGoal=null;setMode('bath',5);care('bath','clean',23);say(sp==='fish'?T('Air bersih, sirip gembira!','Fresh water, happy fins!'):T('Buih di mana-mana!','Bubbles everywhere!'));spawnFoam();sound();}
      else if(n==='kiss'){walkGoal=null;var front=env.home.clone();front.z=Math.min(env.bounds.z,1.3);front.x=0;goTo(front,'kiss',3.5);happy=1;care('kiss','joy',5);say(T('Ciuman untuk awak!','A little kiss, just for you.'));var r=wrap.getBoundingClientRect();kissMark(r.width*.5,r.height*.54);hearts(5);sound();}
      else if(n==='surprise'){var tricks=sp==='cat'?['sneeze','roll','zoomies','play']:sp==='bird'?['roll','sneeze','play','stretch']:['roll','zoomies','play'];setMode(tricks[Math.floor(Math.random()*tricks.length)],4);say(sp==='cat'?T('Saya memang sengaja buat begitu.','I definitely meant to do that.'):sp==='bird'?T('Lihat bakat saya!','Behold. My very special talent.'):T('Pusingan gelembung!','One very important bubble mission.'));hearts(3);}
      else if(n==='poke'){walkGoal=null;setMode('poke',1.5);sound();}persist();updateUI();}
    function care(n,k,v){if(elapsed-(lastCare[n]==null?-100:lastCare[n])>3){gain(k,v);lastCare[n]=elapsed;emit(n==='kiss'?'pet':n,{interaction:n});happy=1;persist();updateUI();}}
    function heartAt(x,y,delay){var e=el('span','vp2-joy',null,'♡');e.style.left=x+'px';e.style.top=y+'px';if(delay)e.style.animationDelay=delay+'s';later(function(){e.remove();},1800+(delay||0)*1000);}
    function hearts(n){if(reduced)n=Math.min(1,n);var w=wrap.clientWidth,h=wrap.clientHeight;for(var i=0;i<n;i++)heartAt(w*.5+(Math.random()-.5)*80,h*.45,i*.09);}
    function ripple(x,y){var e=el('div','vp2-ripple');e.style.left=x+'px';e.style.top=y+'px';later(function(){e.remove();},900);}
    function kissMark(x,y){var e=el('div','vp2-glass-kiss');e.style.left=x+'px';e.style.top=y+'px';later(function(){e.remove();},3100);}
    var foam=[];
    function spawnFoam(){if(!particleGroup)return;var count=lowfx||reduced?7:18,g=new THREE.SphereGeometry(.09,10,7),m=new THREE.MeshPhysicalMaterial({color:0xf4fffa,roughness:.1,metalness:0,transparent:true,opacity:.65,clearcoat:1});for(var i=0;i<count;i++){var b=new THREE.Mesh(g,m);b.position.copy(visual.root.position);b.position.x+=(Math.random()-.5)*1.6;b.position.y+=Math.random()*2;b.position.z+=(Math.random()-.5)*1.4;var s=.5+Math.random();b.scale.setScalar(s);particleGroup.add(b);foam.push({o:b,life:2+Math.random()*2,initial:s});}}
    function photo(){if(!renderer)return;renderer.render(scene,camera);try{var url=renderer.domElement.toDataURL('image/png');if(typeof opts.onPhoto==='function')opts.onPhoto(url,st);else{var a=document.createElement('a');a.download='vpet-'+sp+'.png';a.href=url;a.click();}say(T('Momen kecil disimpan.','A little moment, saved.'));emit('photo');}catch(e){say(T('Gambar tidak dapat disimpan.','This device could not save the photo.'));}}
    var reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
    var pad=el('div','vp2-pad'),stickEl=el('div','vp2-stick',pad),stick={x:0,y:0},padPointer=null;
    pad.setAttribute('role','group');pad.setAttribute('aria-label',T('Kayu bedik pergerakan','Movement thumbstick'));
    function stickMove(e){var r=pad.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/35,y=(e.clientY-r.top-r.height/2)/35,len=Math.max(1,Math.hypot(x,y));stick.x=x/len;stick.y=y/len;stickEl.style.transform='translate('+stick.x*27+'px,'+stick.y*27+'px)';}
    listen(pad,'pointerdown',function(e){e.preventDefault();padPointer=e.pointerId;pad.setPointerCapture(e.pointerId);stickMove(e);});listen(pad,'pointermove',function(e){if(e.pointerId===padPointer)stickMove(e);});function stickEnd(e){if(e.pointerId!==padPointer)return;padPointer=null;stick.x=stick.y=0;stickEl.style.transform='';}listen(pad,'pointerup',stickEnd);listen(pad,'pointercancel',stickEnd);
    try {
      if(!THREE||!Art||!Art[sp])throw new Error('Three.js or VPet models unavailable');
      renderer=new THREE.WebGLRenderer({alpha:false,antialias:!lowfx,powerPreference:lowfx?'low-power':'default',preserveDrawingBuffer:true});renderer.domElement.className='vp2-scene';renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label',T('Rumah haiwan interaktif','Interactive pet home'));wrap.insertBefore(renderer.domElement,top);
      renderer.setPixelRatio(lowfx?1:Math.min(window.devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=!lowfx;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      scene=new THREE.Scene();env=Art.habitat(THREE,sp,lowfx);scene.add(env.root);scene.background=new THREE.Color(env.background||'#dce5d8');scene.fog=new THREE.Fog(env.fog||env.background||'#dce5d8',13,27);
      camera=new THREE.PerspectiveCamera(36,1,.1,60);var cp=env.camera||{position:[0,3.5,9],target:[0,1.4,0]};camera.position.fromArray(cp.position);var camTarget=new THREE.Vector3().fromArray(cp.target);camera.lookAt(camTarget);
      var hemi=new THREE.HemisphereLight(0xfff7e9,0x718276,1.25);scene.add(hemi);var sun=new THREE.DirectionalLight(0xffeed9,2.65);sun.position.set(-3.8,6,5);sun.castShadow=!lowfx;sun.shadow.mapSize.set(1024,1024);sun.shadow.normalBias=.04;sun.shadow.bias=-.0002;sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.camera.far=22;sun.shadow.radius=3;scene.add(sun);var rim=new THREE.DirectionalLight(0xd5e9e9,1.4);rim.position.set(4,4,-3);scene.add(rim);var fillLight=new THREE.DirectionalLight(0xffffff,.35);fillLight.position.set(1,2,5);scene.add(fillLight);
      // A local studio environment gives the eyes and scales real reflected highlights.
      var studio=new THREE.Scene();studio.background=new THREE.Color(0xa8b8b3);var panelGeo=new THREE.PlaneGeometry(6,4),panelMat=new THREE.MeshBasicMaterial({color:0xffffff});var lightPanel=new THREE.Mesh(panelGeo,panelMat);lightPanel.position.set(-3,4,4);lightPanel.lookAt(0,0,0);studio.add(lightPanel);var lp2=lightPanel.clone();lp2.position.set(4,2,-2);lp2.lookAt(0,0,0);studio.add(lp2);var pmrem=new THREE.PMREMGenerator(renderer),envTarget=pmrem.fromScene(studio,.08,.1,30);scene.environment=envTarget.texture;pmrem.dispose();panelGeo.dispose();panelMat.dispose();
      particleGroup=new THREE.Group();scene.add(particleGroup);rebuildPet();
    } catch(err) {
      if(scene)disposeTree(scene);if(envTarget)envTarget.dispose();if(renderer){renderer.dispose();renderer.forceContextLoss();}wrap.querySelectorAll('canvas').forEach(function(c){c.remove();});top.remove();tools.remove();utilities.remove();bottom.remove();pad.remove();var message=el('div','vp2-error');el('strong','',message,T('Rumah kecil perlukan WebGL','This little home needs WebGL'));el('p','',message,T('Cuba pelayar dengan grafik 3D diaktifkan.','Try a browser with 3D graphics enabled.'));persist();return {stop:function(){if(!alive)return;alive=false;persist();removers.forEach(function(f){f();});wrap.remove();},act:function(){},state:function(){return st;},diagnostics:function(){return {error:err.message};}};
    }
    function addAccessory(){if(!visual||!visual.head)return;var a=st.look.acc;if(a==='none')return;accessory=new THREE.Group();var m=new THREE.MeshStandardMaterial({color:0x8a5364,roughness:.8}),cream=new THREE.MeshStandardMaterial({color:0xffe6a5,roughness:.65}),scale=sp==='cat'?.8:sp==='bird'?.6:.5;function sphere(x,y,z,sx,sy,sz,mat){var o=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);accessory.add(o);return o;}
      if(a==='bow'){sphere(-.18,0,0,.21,.14,.08,m).rotation.z=-.35;sphere(.18,0,0,.21,.14,.08,m).rotation.z=.35;sphere(0,0,.03,.08,.09,.08,cream);accessory.position.set(.48,.61,.42);}
      else if(a==='flower'){for(var i=0;i<5;i++)sphere(Math.cos(i*1.257)*.14,Math.sin(i*1.257)*.14,0,.10,.12,.04,cream);sphere(0,0,.05,.09,.09,.05,m);accessory.position.set(-.55,.55,.36);}
      else if(a==='cap'){var cap=new THREE.Mesh(new THREE.SphereGeometry(.58,24,12,0,Math.PI*2,0,Math.PI/2),m);accessory.add(cap);sphere(0,0,.32,.48,.035,.38,cream);accessory.position.y=.51;}
      else if(a==='scarf'){var scarf=new THREE.Mesh(new THREE.TorusGeometry(.46,.10,8,32),m);scarf.rotation.x=Math.PI/2;accessory.add(scarf);sphere(.25,-.25,.3,.11,.34,.05,m);accessory.position.y=-.51;}
      accessory.scale.setScalar(scale);visual.head.add(accessory);
    }
    function rebuildPet(){var position=visual?visual.root.position.clone():env.home.clone(),angle=visual?visual.root.rotation.y:(sp==='fish'?.65:sp==='cat'?.12:.06);if(visual){scene.remove(visual.root);disposeTree(visual.root);}visual=Art[sp](THREE,Object.assign({},st.look,{acc:'none'}),lowfx);scene.add(visual.root);visual.root.position.copy(position);visual.root.rotation.y=angle;rootScale=1;addAccessory();if(st.sleeping){visual.root.position.copy(env.sleep);setMode('sleep',Infinity);}}
    listen(moveBtn,'click',function(){if(freeMove&&renderer)renderer.domElement.focus({preventScroll:true});});
    var baseCP=camera.position.clone(),baseTarget=camTarget.clone();
    function resize(){if(!alive)return;var w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<.62?42:w/h>1.4?32:36;camera.position.copy(baseCP);camera.lookAt(baseTarget);camera.updateProjectionMatrix();}
    var observer=window.ResizeObserver?new ResizeObserver(resize):null;if(observer)observer.observe(host);else listen(window,'resize',resize);resize();
    var ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),-env.home.y),hit=new THREE.Vector3(),targetLook=new THREE.Vector2();
    function pointFrom(e){var r=renderer.domElement.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,nx:(e.clientX-r.left)/r.width*2-1,ny:-((e.clientY-r.top)/r.height)*2+1};}
    function touchTarget(p){ndc.set(p.nx,p.ny);ray.setFromCamera(ndc,camera);if(sp==='fish'){var frontPlane=new THREE.Plane(new THREE.Vector3(0,0,1),-.5);if(ray.ray.intersectPlane(frontPlane,hit))return new THREE.Vector3(clamp(hit.x,-env.bounds.x,env.bounds.x),clamp(hit.y,env.bounds.yMin,env.bounds.yMax),.5);}if(ray.ray.intersectPlane(plane,hit))return new THREE.Vector3(clamp(hit.x,-env.bounds.x,env.bounds.x),env.home.y,clamp(hit.z,-env.bounds.z,env.bounds.z));return env.home.clone();}
    listen(renderer.domElement,'pointerdown',function(e){if(e.button!==0)return;e.preventDefault();renderer.domElement.focus({preventScroll:true});if(st.sleeping){wake();updateUI();}var p=pointFrom(e);ndc.set(p.nx,p.ny);ray.setFromCamera(ndc,camera);var petHit=ray.intersectObject(visual.root,true).length>0;pointer={id:e.pointerId,start:p,last:p,moved:0,time:elapsed,onPet:petHit};holdTime=0;renderer.domElement.setPointerCapture(e.pointerId);targetLook.set(p.nx,p.ny);ripple(p.x,p.y);});
    listen(renderer.domElement,'pointermove',function(e){var p=pointFrom(e);targetLook.set(p.nx,p.ny);if(!pointer||e.pointerId!==pointer.id)return;var d=Math.hypot(p.x-pointer.last.x,p.y-pointer.last.y);pointer.moved+=d;pointer.last=p;if(pointer.moved>9&&(pointer.onPet||gesturePet)){if(mode!=='pet'){walkGoal=null;setMode('pet',2);}else{phase=0;}if(d>3){care('pet','joy',5);happy=1;if(Math.random()<.09)heartAt(p.x,p.y);}}else if(pointer.moved>12||holdTime>.35){walkGoal=touchTarget(p);arrival={mode:'idle',duration:3};if(mode!=='walk')setMode('walk',30);}});
    function pointerEnd(e){if(!pointer||pointer.id!==e.pointerId)return;var p=pointFrom(e),was=pointer;pointer=null;if(e.type==='pointercancel'){holdTime=0;return;}if(was.moved<9&&elapsed-was.time<.45){if(gesturePet){care('pet','joy',7);setMode('pet',3);hearts(2);sound('purr');}else{var front=touchTarget(p);front.z=Math.min(env.bounds.z,1.3);goTo(front,'poke',1.8);say(sp==='cat'?T('Oh! Awak di situ.','Oh! There you are.'):sp==='bird'?T('Ciap! Hai awak.','Peep! Hello, you.'):T('Bloop. Hai!','Bloop. Hello!'));sound();}}holdTime=0;}
    listen(renderer.domElement,'pointerup',pointerEnd);listen(renderer.domElement,'pointercancel',pointerEnd);listen(renderer.domElement,'pointerleave',function(){if(!pointer)targetLook.set(0,0);});
    listen(renderer.domElement,'keydown',function(e){if(e.key==='Escape'){closePanel();freeMove=false;pad.classList.remove('visible');moveBtn.setAttribute('aria-pressed','false');updateUI();}if(freeMove&&/^(Arrow|[wasdWASD])/.test(e.key)){e.preventDefault();pressed[e.key.toLowerCase()]=true;}});
    listen(renderer.domElement,'keyup',function(e){pressed[e.key.toLowerCase()]=false;});listen(window,'blur',function(){pressed={};pointer=null;stick.x=stick.y=0;});
    function visibility(){if(!host.isConnected){stop();return;}paused=document.hidden;last=0;if(paused){persist();cancelAnimationFrame(raf);raf=0;}else if(alive&&!raf){settle();updateUI();raf=requestAnimationFrame(frame);}}
    listen(document,'visibilitychange',visibility);
    listen(renderer.domElement,'webglcontextlost',function(e){e.preventDefault();paused=true;say(T('Grafik dijeda. Buka semula pet.','Graphics paused. Please reopen your pet.'),60);});
    function chooseIdle(){var options=sp==='cat'?['idle','stretch','groom','yawn','sneeze','walk','roll','play']:sp==='bird'?['idle','groom','stretch','play','walk','sneeze']:['idle','walk','stretch','play','roll'];if(st.personality==='dreamy')options=options.concat(['idle','yawn','idle']);if(st.personality==='playful')options=options.concat(['play','walk','zoomies']);var choice=options[Math.floor(Math.random()*options.length)];if(st.s.energy<20){settle();st.sleeping=true;goTo(env.sleep,'sleep',Infinity);say(T('Tidur sebentar sahaja…','Just resting my little eyes…'));emit('sleep');persist();return;}if(st.s.hunger<25&&Date.now()-(st.lastHungryHint||0)>20000){st.lastHungryHint=Date.now();goTo(env.bowl,'idle',4);say(T('Masa makan?','Is it snack o’clock?'));return;}if(st.s.clean<25){choice='groom';say(T('Masa untuk bersihkan bulu.','A little tidying up.'));}if(st.s.joy<25){choice='play';say(T('Boleh main bersama?','Could we play together?'));}if(choice==='walk'||choice==='zoomies'){goTo(new THREE.Vector3((Math.random()-.5)*env.bounds.x*1.5,sp==='fish'?env.bounds.yMin+Math.random()*(env.bounds.yMax-env.bounds.yMin):env.home.y,(Math.random()-.5)*env.bounds.z*1.6),choice==='zoomies'?'play':'idle',3);if(choice==='zoomies')mode='run';}else{setMode(choice,choice==='idle'?3+Math.random()*4:3+Math.random()*2);if(choice==='sneeze')say(T('A… a… ciu!','A… a… choo!'));}}
    var detachedObserver=new MutationObserver(function(){if(!host.isConnected)stop();});detachedObserver.observe(document.documentElement,{childList:true,subtree:true});
    var velocity=new THREE.Vector3();
    function frame(timestamp){raf=0;if(!alive||paused)return;if(!host.isConnected){stop();return;}raf=requestAnimationFrame(frame);var fps=lowfx||st.sleeping||(!walkGoal&&!pointer&&!freeMove&&mode==='idle')?30:60;if(timestamp-lastFrame<1000/fps-.7)return;var dt=last?Math.min((timestamp-last)/1000,.055):1/fps;last=timestamp;lastFrame=timestamp;elapsed+=dt;phase+=dt;happy=Math.max(0,happy-dt*.17);if(pointer){holdTime+=dt;if(holdTime>.4&&!pointer.onPet&&!freeMove&&!gesturePet){walkGoal=touchTarget(pointer.last);arrival={mode:'idle',duration:3};if(mode!=='walk')setMode('walk',30);}}
      if(speechTime>0){speechTime-=dt;if(speechTime<=0)speech.classList.remove('show');}
      lookX=ease(lookX,clamp(targetLook.x,-1,1),dt,5);lookY=ease(lookY,clamp(targetLook.y,-1,1),dt,5);
      blinkAt-=dt;if(blinkAt<0){blinkPhase+=dt;blink=Math.sin(clamp(blinkPhase/.18,0,1)*Math.PI);if(blinkPhase>.18){blink=0;blinkAt=2+Math.random()*4;blinkPhase=0;}}
      var desired=new THREE.Vector3(),moving=false,goalAngle=0,remainingDistance=Infinity;
      if(freeMove&&!st.sleeping){var ix=stick.x+(pressed.arrowright||pressed.d?1:0)-(pressed.arrowleft||pressed.a?1:0),iz=stick.y+(pressed.arrowdown||pressed.s?1:0)-(pressed.arrowup||pressed.w?1:0);desired.set(ix,0,iz);if(sp==='fish'){desired.y=-iz;desired.z=0;}if(desired.lengthSq()>.01){desired.normalize();moving=true;walkGoal=null;mode='walk';goalAngle=Math.atan2(desired.x,sp==='fish'?.65:desired.z);}else if(mode==='walk'){setMode('idle',3);}}
      else if(walkGoal){desired.copy(walkGoal).sub(visual.root.position);if(sp!=='fish')desired.y=0;var distance=desired.length();remainingDistance=distance;if(distance<.06){visual.root.position.copy(walkGoal);walkGoal=null;speed=0;velocity.set(0,0,0);var next=arrival||{mode:'idle',duration:3};arrival=null;setMode(next.mode,next.duration);if(mode==='eat'){gain('hunger',26);gain('joy',4);hearts(2);persist();updateUI();}if(mode==='sleep'){visual.root.rotation.y=0;persist();}}else{moving=true;desired.normalize();goalAngle=Math.atan2(desired.x,desired.z);}}
      speed=ease(speed,moving?Math.min(remainingDistance*3,mode==='run'||mode==='zoomies'?2.6:sp==='fish'?1.1:1.35):0,dt,moving?4:8);
      velocity.lerp(desired.multiplyScalar(moving?speed:0),1-Math.exp(-dt*(moving?9:12)));if(mode==='sleep'||mode==='pet'||mode==='eat')velocity.multiplyScalar(Math.exp(-dt*20));visual.root.position.addScaledVector(velocity,dt);
      if(moving){var delta=Math.atan2(Math.sin(goalAngle-visual.root.rotation.y),Math.cos(goalAngle-visual.root.rotation.y));visual.root.rotation.y+=delta*(1-Math.exp(-dt*6));}
      else if(mode!=='sleep'){var neutral=mode==='kiss'||mode==='poke'?0:sp==='fish'?.65:sp==='cat'?.12:.06;var turn=Math.atan2(Math.sin(neutral-visual.root.rotation.y),Math.cos(neutral-visual.root.rotation.y));visual.root.rotation.y+=turn*(1-Math.exp(-dt*2));}
      visual.root.position.x=clamp(visual.root.position.x,-env.bounds.x,env.bounds.x);visual.root.position.z=clamp(visual.root.position.z,-env.bounds.z,env.bounds.z);if(sp==='fish')visual.root.position.y=clamp(visual.root.position.y,env.bounds.yMin,env.bounds.yMax);
      if(!walkGoal&&!freeMove&&phase>modeDuration){if(mode==='pet')gesturePet=false;setMode('idle',2);chooseIdle();updateUI();}
      gait+=dt*(speed*5+1);var showMode=mode;if(mode==='sleep'&&!st.sleeping)showMode='idle';visual.update(elapsed,dt,{speed:speed,gait:gait,mode:showMode,phase:phase,lookX:lookX,lookY:lookY,blink:st.sleeping?1:blink,happy:happy,time:elapsed,reducedMotion:reduced});
      // Breathing stays at the character root; locomotion never teleports.
      var scaleTarget=mode==='kiss'?1.075:1;rootScale=ease(rootScale,scaleTarget,dt,4);visual.root.scale.setScalar(rootScale);
      var h=(new Date()).getHours(),night=st.night==='night'?1:st.night==='day'?0:(h>=19||h<7?1:0);nightValue=ease(nightValue,night,dt,1);hemi.intensity=1.25-nightValue*.45;sun.intensity=2.65-nightValue*1.95;rim.intensity=1.4+nightValue*.15;renderer.toneMappingExposure=.92-nightValue*.07;if(env.update)env.update(elapsed,dt,nightValue);
      if(env.toy&&toyGoal&&sp==='cat'){var dx=toyGoal.x-env.toy.position.x,dz=toyGoal.z-env.toy.position.z;env.toy.position.x=ease(env.toy.position.x,toyGoal.x,dt,3.2);env.toy.position.z=ease(env.toy.position.z,toyGoal.z,dt,3.2);env.toy.rotation.x+=dz*dt*10;env.toy.rotation.z-=dx*dt*10;if(Math.hypot(dx,dz)<.01)toyGoal=null;}if(env.toy&&sp==='bird'&&bellKick>.005){bellKick*=Math.exp(-dt*.8);env.toy.rotation.z=Math.sin(elapsed*16)*.3*bellKick;}
      if(mode==='bath'&&phase<4&&Math.random()<dt*2&&foam.length<30)spawnFoam();for(var i=foam.length-1;i>=0;i--){var f=foam[i];f.life-=dt;f.o.position.y+=dt*.45;f.o.position.x+=Math.sin(elapsed+i)*dt*.07;f.o.scale.setScalar(f.initial*Math.min(1,f.life));if(f.life<=0){particleGroup.remove(f.o);foam.splice(i,1);if(!foam.some(function(x){return x.o.geometry===f.o.geometry;})){f.o.geometry.dispose();f.o.material.dispose();}}}
      var hp=new THREE.Vector3();visual.head.getWorldPosition(hp);hp.y+=sp==='cat'?1.1:.8;hp.project(camera);speech.style.left=clamp((hp.x*.5+.5)*wrap.clientWidth,100,Math.max(100,wrap.clientWidth-100))+'px';speech.style.top=clamp((-hp.y*.5+.5)*wrap.clientHeight,155,wrap.clientHeight*.58)+'px';
      renderer.render(scene,camera);var timeNow=Date.now();if(timeNow-lastSave>=15000){settle();if(st.sleeping&&st.s.energy>=99){wake();say(T('Sedia untuk hari baharu!','Ready for a brand new adventure.'));}persist();updateUI();}
    }
    function stop(){if(!alive)return;alive=false;cancelAnimationFrame(raf);persist();if(observer)observer.disconnect();if(detachedObserver)detachedObserver.disconnect();removers.forEach(function(fn){fn();});panelRemovers.forEach(function(fn){fn();});joyTimers.forEach(clearTimeout);if(audio)audio.close().catch(function(){});disposeTree(scene);if(envTarget)envTarget.dispose();renderer.renderLists.dispose();renderer.dispose();renderer.forceContextLoss();wrap.remove();}
    updateUI();say(st.sleeping?T('Zzz… mimpi indah.','Zzz… little dreams.'):T('Hai, saya '+st.n+'.','Hello, I’m '+st.n+'.'),4);persist();raf=requestAnimationFrame(frame);
    return {stop:stop,act:act,state:function(){return st;},photo:photo,diagnostics:function(){return {mode:mode,phase:phase,speed:speed,position:visual.root.position.toArray(),lowfx:lowfx,paused:paused,alive:alive,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,programs:renderer.info.programs.length};}};
  }};
})();

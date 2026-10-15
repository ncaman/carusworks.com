// carusworks 공통 스크립트: 메뉴, 첫 화면 예시, 문의 폼
// 상담 접수 엔드포인트(Formspree 또는 Google Apps Script). 비어 있으면 메일 초안으로 대신합니다.
var FORM_ENDPOINT = "";
(function(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 메뉴
  var burger = document.querySelector(".burger"), nav = document.getElementById("nav");
  if(burger && nav){
    burger.addEventListener("click", function(){
      var open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });
  }

  // 영상: 움직임 줄이기면 멈춘 그림만
  document.querySelectorAll("video[data-auto]").forEach(function(v){
    if(reduce){ v.removeAttribute("autoplay"); v.pause(); return; }
    var p = v.play(); if(p && p.catch) p.catch(function(){});
  });

  // 첫 화면 예시: 지시 → 계획 → 사전 검증 → 승인 → 실행
  var say = document.getElementById("saytext");
  if(say){
    var data = [
      {say:"지난주 민원 중에 주차 관련만 모아서 담당자별로 정리해 줘",
       steps:[["계획","조회 → 분류 → 담당자별 정리 절차 작성",""],["검증","사전 검증 통과 · 조회 범위와 권한 확인","G"],
              ["실행","민원 시스템 조회","1,284건"],["실행","주차 관련 분류","213건"],["실행","담당자별 정리","4개 부서"]],
       done:"보고서 초안 완료 · 실행 기록 저장"},
      {say:"이번 달 미수금 거래처 뽑아서 영업 담당에게 알려 줘",
       steps:[["계획","회계 조회 → 담당자 매칭 → 알림 절차 작성",""],["검증","사전 검증 통과 · 발송 대상과 문구 확인","G"],
              ["실행","회계 시스템 조회","37곳"],["실행","거래처별 담당자 매칭","6명"],["실행","담당자별 알림 발송","6건"]],
       done:"알림 발송 완료 · 실행 기록 저장"},
      {say:"내일 오전 3층 회의실 냉방 미리 켜고, 방문객 출입 등록해 줘",
       steps:[["계획","일정 확인 → 냉방 예약 → 출입 등록 절차 작성",""],["검증","사전 검증 통과 · 온도 범위와 출입 권한 확인","G"],
              ["실행","냉방 예약","08:30 · 24℃"],["실행","방문객 출입 등록","4명"],["실행","담당자 안내","1건"]],
       done:"예약·등록 완료 · 실행 기록 저장"}
    ];
    var list = document.getElementById("steps"), ok = document.getElementById("okbox"),
        okText = document.getElementById("oktext"), okBtn = document.getElementById("okbtn"), timers = [], cur = 0, auto = !reduce;
    var later = function(fn, ms){ timers.push(setTimeout(fn, ms)); };
    var clear = function(){ timers.forEach(clearTimeout); timers = []; };
    var tabs = document.querySelectorAll(".dtabs button");
    [].forEach.call(tabs, function(t){ t.addEventListener("click", function(){ auto = false; show(+t.dataset.i); }); });
    var show = function(i){
      clear(); cur = i; var d = data[i];
      [].forEach.call(tabs, function(t, j){ t.setAttribute("aria-selected", j === i ? "true" : "false"); });
      list.innerHTML = d.steps.map(function(s){
        var g = s[2] === "G";
        return '<li class="' + (g ? "chk" : "") + '"><b>' + (g ? "◆" : "✓") + '</b><span>' + s[0] + ' · ' + s[1] + '</span><em>' + (g ? "" : s[2]) + '</em></li>';
      }).join("");
      var items = list.querySelectorAll("li");
      ok.classList.remove("on"); okBtn.disabled = false; okBtn.textContent = "승인";
      var approve = function(){
        clear(); okBtn.disabled = true; okBtn.textContent = "승인됨"; var k = 2;
        (function run(){
          if(k < items.length){ items[k++].classList.add("on"); later(run, 480); }
          else { okText.textContent = d.done; okBtn.textContent = "완료"; if(auto) later(function(){ show((cur + 1) % data.length); }, 3400); }
        })();
      };
      okBtn.onclick = function(){ auto = false; approve(); };
      if(reduce){ say.textContent = d.say; items.forEach(function(li){ li.classList.add("on"); }); okText.textContent = d.done; okBtn.textContent = "완료"; okBtn.disabled = true; ok.classList.add("on"); return; }
      say.textContent = ""; var n = 0;
      (function type(){
        if(n <= d.say.length){ say.textContent = d.say.slice(0, n++); later(type, 36); return; }
        later(function(){ items[0].classList.add("on"); }, 300);
        later(function(){ items[1].classList.add("on"); }, 900);
        later(function(){ okText.textContent = "사전 검증 통과 · 승인하면 실행됩니다"; ok.classList.add("on"); if(auto) later(approve, 1500); }, 1300);
      })();
    };
    show(0);
  }

  // 문의 폼
  var wiz = document.getElementById("wiz");
  if(wiz){
    var step = 0, qs = Array.prototype.slice.call(wiz.querySelectorAll(".q")).slice(0, 4),
        meta = document.getElementById("wizmeta"), prog = document.getElementById("wizprog"),
        prev = document.getElementById("wizprev"), next = document.getElementById("wiznext"), err = document.getElementById("wizerr");
    var picked = function(g){ return Array.prototype.map.call(g.querySelectorAll('[aria-pressed="true"]'), function(b){ return b.textContent.trim(); }); };
    var val = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    var draw = function(){
      qs.forEach(function(q, i){ q.classList.toggle("on", i === step); });
      meta.textContent = (step + 1) + " / 4"; prog.style.width = ((step + 1) * 25) + "%";
      prev.disabled = step === 0; next.textContent = step === 3 ? "상담 신청" : "다음"; err.textContent = "";
    };
    wiz.querySelectorAll(".opts").forEach(function(g){
      g.addEventListener("click", function(e){
        var b = e.target.closest("button"); if(!b) return;
        if(g.getAttribute("data-mode") === "single"){ g.querySelectorAll("button").forEach(function(x){ x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); }
        else b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
      });
    });
    var check = function(){
      if(step === 0 && !picked(qs[0].querySelector(".opts")).length) return "기관 유형을 선택하세요.";
      if(step === 1 && !picked(qs[1].querySelector(".opts")).length) return "필요한 범위를 하나 이상 고르세요.";
      if(step === 3){
        if(!val("wizname")) return "이름을 입력하세요.";
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("wizmail"))) return "이메일 주소를 입력하세요.";
        if(!document.getElementById("wizagree").checked) return "개인정보 수집에 동의해야 접수할 수 있습니다.";
      }
      return "";
    };
    var payload = function(){
      return {"고객 유형": picked(qs[0].querySelector(".opts")).join(", "), "필요 범위": picked(qs[1].querySelector(".opts")).join(", "),
              "규모": val("wizscale") || "-", "희망 시기": val("wizwhen") || "-", "이름": val("wizname"), "소속": val("wizorg") || "-",
              "이메일": val("wizmail"), "전화": val("wizphone") || "-", "메모": val("wiznote") || "-"};
    };
    var done = function(){
      qs.forEach(function(q){ q.classList.remove("on"); });
      document.getElementById("wizok").classList.add("on");
      document.getElementById("wizbar").style.display = "none";
      document.getElementById("wizfine").style.display = "none";
      prog.style.width = "100%";
    };
    var mail = function(d){
      var body = Object.keys(d).map(function(k){ return k + ": " + d[k]; }).join("\n");
      document.getElementById("wizokh").textContent = "마지막 단계입니다.";
      document.getElementById("wizokp").textContent = "아래 내용을 메일로 보내 주시면 접수가 끝납니다. 진단 상담을 준비해 회신드립니다.";
      document.getElementById("wizsum").textContent = body;
      document.getElementById("wizmailto").href = "mailto:contact@carusworks.com?subject=" + encodeURIComponent("carusworks 도입 상담") + "&body=" + encodeURIComponent(body);
      document.getElementById("wizmailbox").hidden = false;
      var cp = document.getElementById("wizcopy");
      cp.onclick = function(){
        var ok = function(){ cp.textContent = "복사했습니다"; };
        if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText("받는 곳: contact@carusworks.com\n제목: carusworks 도입 상담\n\n" + body).then(ok, function(){ cp.textContent = "직접 선택해 복사해 주세요"; }); }
        else cp.textContent = "직접 선택해 복사해 주세요";
      };
      done();
    };
    prev.addEventListener("click", function(){ if(step > 0){ step--; draw(); } });
    next.addEventListener("click", function(){
      var m = check(); if(m){ err.textContent = m; return; }
      if(step < 3){ step++; draw(); return; }
      var d = payload();
      if(!FORM_ENDPOINT){ mail(d); return; }
      next.disabled = true; next.textContent = "보내는 중…";
      fetch(FORM_ENDPOINT, {method:"POST", headers:{"Accept":"application/json","Content-Type":"application/json"}, body:JSON.stringify(d)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); done(); })
        .catch(function(){ next.disabled = false; next.textContent = "상담 신청"; err.textContent = "전송하지 못했습니다. 잠시 후 다시 시도하거나 contact@carusworks.com 으로 보내 주세요."; });
    });
    draw();
  }
})();

// 아키텍처 탐색기: 계층 펼치기 + 지시 하나가 흐르는 길
(function(){
  var cmx = document.getElementById("cmx");
  if(!cmx) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var rows = Array.prototype.slice.call(cmx.querySelectorAll(".cmx-l, .cmx-link"));
  cmx.querySelectorAll(".cmx-l > button").forEach(function(b){
    b.addEventListener("click", function(){
      var li = b.parentNode, open = !li.classList.contains("open");
      cmx.querySelectorAll(".cmx-l.open").forEach(function(o){ o.classList.remove("open"); o.querySelector("button").setAttribute("aria-expanded", "false"); });
      if(open){ li.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
    });
  });
  var steps = [
    ["svc", "① 담당자가 '에너지·환경 제어' 서비스에 요청을 입력합니다."],
    ["mcp", "② 요청은 표준 프로토콜(MCP)을 통해 에이전트로 전달됩니다. 어떤 시스템이든 같은 방식으로 연동됩니다."],
    ["agt", "③ 에너지 최적화 에이전트(A3)가 업무를 맡고, 공간 지능 에이전트(A4)에 내일 재실 예측을 요청합니다(A2A)."],
    ["orc", "④ 사내 서버의 소형 모델(SLM)이 실행 절차를 작성합니다. 온톨로지에서 '3층 회의실 – 냉방기 2대' 관계를 조회하고, 고난도 판단만 대형 모델(LLM)에 맡깁니다."],
    ["dat", "⑤ 회의 일정·재실·온습도·장비 상태 데이터를 표준 규격으로 조회합니다."],
    ["svc", "⑥ 디지털 트윈 검증과 담당자 승인을 거쳐 냉방이 예약되고, 결과와 이력이 서비스 화면에 표시됩니다.", "done"]
  ];
  var dot = cmx.querySelector(".cmx-dot"), play = document.getElementById("cmxplay"), timers = [], ran = false;
  var clear = function(){ timers.forEach(clearTimeout); timers = []; };
  var row = function(k){ return cmx.querySelector('[data-l="' + k + '"]'); };
  var reset = function(){ rows.forEach(function(r){ r.classList.remove("lit", "past", "done"); var c = r.querySelector(".cmx-cap"); if(c) c.textContent = ""; }); dot.style.opacity = 0; dot.classList.remove("back"); };
  var go = function(i){
    var s = steps[i], r = row(s[0]);
    rows.forEach(function(x){ if(x.classList.contains("lit")){ x.classList.remove("lit"); x.classList.add("past"); } });
    if(s[2]){ r.classList.add("done"); dot.classList.add("back"); }
    r.classList.remove("past"); r.classList.add("lit");
    r.querySelector(".cmx-cap").textContent = s[1];
    dot.style.opacity = 1; dot.style.top = (r.offsetTop + (r.classList.contains("cmx-link") ? 18 : 30)) + "px";
  };
  var run = function(){
    clear(); reset(); ran = true;
    play.innerHTML = "<i>■</i> 멈춤";
    if(reduce){ steps.forEach(function(_, i){ go(i); }); play.innerHTML = "<i>↻</i> 다시 보기"; return; }
    steps.forEach(function(_, i){ timers.push(setTimeout(function(){ go(i); if(i === steps.length - 1) play.innerHTML = "<i>↻</i> 다시 보기"; }, i * 2600)); });
  };
  play.addEventListener("click", function(){
    if(timers.length && play.textContent.indexOf("멈춤") > -1){ clear(); play.innerHTML = "<i>▶</i> 처음부터 다시"; return; }
    run();
  });
  if("IntersectionObserver" in window && !reduce){
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting && !ran){ run(); io.disconnect(); } }); }, {threshold: .45});
    io.observe(cmx);
  }
})();

/* 결재 요청 시뮬레이터 — 공개 계산식(예시값) */
(function(){
  var r = document.getElementById("dsim"); if(!r) return;
  function $(i){ return document.getElementById(i); }
  var K = {D:$("kD"), P:$("kP"), H:$("kH"), T:$("kT")}, sel = null, best = null;
  var won = function(v){ v = Math.round(v); if(v >= 1e8){ var e = Math.floor(v/1e8), m = Math.round((v%1e8)/1e7)*1000; return e+"억"+(m?" "+m.toLocaleString()+"만":"")+" 원"; } return Math.round(v/1e4).toLocaleString()+"만 원"; };
  var pay = function(cost, save){ var m = cost/save; return m < 24 ? (m < 1 ? "회수 "+Math.max(1,Math.round(m*30))+"일" : "회수 "+m.toFixed(1)+"개월") : "회수 "+(m/12).toFixed(1)+"년"; };
  function calc(){
    var d = +K.D.value/100, P = +K.P.value, H = +K.H.value, T = +K.T.value;
    $("oD").textContent = K.D.value+"%"; $("oP").textContent = P+" kW"; $("oH").textContent = H+"시간"; $("oT").textContent = T+"원/kWh";
    var kwh = P*H*30*d, loss = kwh*T, base = P*H*30*T;
    $("dsLoss").textContent = "월 "+won(loss); $("dsKwh").textContent = "(월 "+Math.round(kwh).toLocaleString()+" kWh 초과 사용)";
    var o = {clean:{c:1.2e6, s:loss*.75}, replace:{c:3.5e8, s:loss+base*.2}};
    $("e1").textContent = pay(o.clean.c, o.clean.s); $("e2").textContent = "점검 1시간"; $("e3").textContent = pay(o.replace.c, o.replace.s);
    var mC = o.clean.c/o.clean.s, mR = o.replace.c/o.replace.s;
    best = d >= .15 && mR < 60 ? "replace" : (d < .04 ? "check" : "clean");
    var why = {clean:"세척 비용이 "+pay(o.clean.c, o.clean.s).replace("회수 ","")+" 안에 회수됩니다. 이번 주 세척을 권고합니다.",
      check:"저하율이 낮아 원인 확인이 먼저입니다. 냉매 압력 점검 후 판단을 권고합니다.",
      replace:"저하 폭이 커서 세척으로는 25%가 남습니다. 교체 회수 기간이 "+(mR/12).toFixed(1)+"년으로 5년 이내여서 교체 검토를 권고합니다."};
    $("dsRec").textContent = "AI 권고 · "+why[best];
    [].forEach.call(r.querySelectorAll(".o"), function(b){ b.classList.toggle("best", b.dataset.k === best); });
    $("dsH").textContent = "냉방 효율 "+K.D.value+"% 저하, 4주 연속";
    var pts = [], n = 8, cop0 = 4.6;
    for(var i=0;i<n;i++){ var w = i < 4 ? 0 : (i-3)/4, cop = cop0*(1 - d*w) + (i%2 ? .04 : -.03); pts.push([i*(300/(n-1)), 32 - (cop-cop0)*(18/(.1*cop0))]); }
    pts = pts.map(function(p){ return [p[0].toFixed(1), Math.max(4, Math.min(60, p[1])).toFixed(1)]; });
    $("dsLine").setAttribute("points", pts.map(function(p){ return p.join(","); }).join(" "));
    $("dsDot").setAttribute("cx", pts[n-1][0]); $("dsDot").setAttribute("cy", pts[n-1][1]);
    upd();
  }
  function upd(){
    var names = {clean:"응축기 세척", check:"냉매 압력 점검", replace:"설비 교체"};
    [].forEach.call(r.querySelectorAll(".o"), function(b){ b.setAttribute("aria-checked", b.dataset.k === sel ? "true" : "false"); });
    $("dsOk").disabled = !sel;
    $("dsSel").textContent = sel ? "선택 · "+names[sel]+(sel !== best ? " (권고와 다름, 사유 기록)" : "") : "조치안을 선택하세요";
  }
  [].forEach.call(r.querySelectorAll(".o"), function(b){ b.addEventListener("click", function(){ sel = b.dataset.k; upd(); }); });
  for(var k in K) K[k].addEventListener("input", calc);
  $("dsOk").addEventListener("click", function(){
    if(!sel) return;
    var t = new Date(), h = 0, src = sel+K.D.value+K.P.value+K.H.value+K.T.value+t.getTime();
    for(var i=0;i<src.length;i++){ h = (h*31 + src.charCodeAt(i)) >>> 0; }
    var ts = t.toTimeString().slice(0,8);
    $("dsLog").textContent = "✓ 승인 기록 "+ts+" · #"+h.toString(16).padStart(8,"0")+" · 계획→검증→승인 이력 저장";
  });
  sel = null; calc();
  /* 처음 보일 때 저하율을 한 번 움직여 숫자·권고가 바뀌는 걸 보여 줌 (손대면 즉시 중단) */
  var touched = false; [].forEach.call(r.querySelectorAll("input,button"), function(el){ el.addEventListener("pointerdown", function(){ touched = true; }); });
  if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window){
    var io = new IntersectionObserver(function(es){ if(!es[0].isIntersecting) return; io.disconnect();
      var seq = [10,12,14,16,18,18,18,16,14,12,10,8], i = 0;
      var tm = setInterval(function(){ if(touched || i >= seq.length){ clearInterval(tm); return; } K.D.value = seq[i++]; calc(); }, 320);
    }, {threshold: .6});
    io.observe(r);
  }
})();

/* 화면에 보일 때만 재생하는 배경 영상 */
(function(){
  var vs = document.querySelectorAll("video[data-inview]"); if(!vs.length) return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ var v = e.target;
    if(e.isIntersecting){ if(v.preload === "none") v.preload = "auto"; var p = v.play(); if(p && p.catch) p.catch(function(){}); } else v.pause(); }); }, {threshold: .15});
  [].forEach.call(vs, function(v){ io.observe(v); });
})();


/* 모바일 하단 고정 버튼: 첫 화면을 지나면 보이고, 마무리 띠·바닥글에서는 숨김 */
(function(){
  var st = document.getElementById("stick"); if(!st) return;
  var end = document.querySelector("section.close, footer");
  var upd = function(){
    var past = window.scrollY > window.innerHeight * .8;
    var nearEnd = end && end.getBoundingClientRect().top < window.innerHeight;
    st.classList.toggle("on", past && !nearEnd);
  };
  window.addEventListener("scroll", upd, {passive: true}); upd();
})();

/* 첫 화면 배경 영상: 페이지 로드가 끝난 뒤에 받기 시작 (데이터 절약 모드·움직임 줄이기면 포스터만) */
(function(){
  var v = document.querySelector("video[data-late]"); if(!v) return;
  var c = navigator.connection || {};
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches || c.saveData) return;
  v.addEventListener("playing", function(){ v.classList.add("on"); }, {once: true});
  var go = function(){ v.preload = "auto"; v.load(); var p = v.play(); if(p && p.catch) p.catch(function(){}); };
  if(document.readyState === "complete") setTimeout(go, 300); else window.addEventListener("load", function(){ setTimeout(go, 300); });
})();

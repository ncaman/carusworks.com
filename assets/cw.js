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

  // 첫 화면 예시: 지시 → 계획 → 가상 검증 → 승인 → 실행
  var say = document.getElementById("saytext");
  if(say){
    var data = [
      {say:"지난주 민원 중에 주차 관련만 모아서 담당자별로 정리해 줘",
       steps:[["계획","조회 → 분류 → 담당자별 정리 절차 작성",""],["검증","가상 실행 통과 · 조회 범위와 권한 확인","G"],
              ["실행","민원 시스템 조회","1,284건"],["실행","주차 관련 분류","213건"],["실행","담당자별 정리","4개 부서"]],
       done:"보고서 초안 완료 · 실행 기록 저장"},
      {say:"이번 달 미수금 거래처 뽑아서 영업 담당에게 알려 줘",
       steps:[["계획","회계 조회 → 담당자 매칭 → 알림 절차 작성",""],["검증","가상 실행 통과 · 발송 대상과 문구 확인","G"],
              ["실행","회계 시스템 조회","37곳"],["실행","거래처별 담당자 매칭","6명"],["실행","담당자별 알림 발송","6건"]],
       done:"알림 발송 완료 · 실행 기록 저장"},
      {say:"내일 오전 3층 회의실 냉방 미리 켜고, 방문객 출입 등록해 줘",
       steps:[["계획","일정 확인 → 냉방 예약 → 출입 등록 절차 작성",""],["검증","가상 실행 통과 · 온도 범위와 출입 권한 확인","G"],
              ["실행","냉방 예약","08:30 · 24℃"],["실행","방문객 출입 등록","4명"],["실행","담당자 안내","1건"]],
       done:"예약·등록 완료 · 실행 기록 저장"}
    ];
    var list = document.getElementById("steps"), ok = document.getElementById("okbox"),
        okText = document.getElementById("oktext"), okBtn = document.getElementById("okbtn"), timers = [], cur = 0, auto = !reduce;
    var later = function(fn, ms){ timers.push(setTimeout(fn, ms)); };
    var clear = function(){ timers.forEach(clearTimeout); timers = []; };
    var show = function(i){
      clear(); cur = i; var d = data[i];
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
        later(function(){ okText.textContent = "가상 검증 통과 · 승인하시면 실행합니다"; ok.classList.add("on"); if(auto) later(approve, 1500); }, 1300);
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
      if(step === 0 && !picked(qs[0].querySelector(".opts")).length) return "어떤 곳인지 하나를 고르세요.";
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
      window.location.href = "mailto:contact@carusworks.com?subject=" + encodeURIComponent("carusworks 도입 상담") + "&body=" + encodeURIComponent(body);
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
    ["svc", "① 사람이 쓰는 기능이 지시를 받습니다. 이번엔 '에너지·환경 제어' 서비스입니다."],
    ["mcp", "② 표준 플러그(MCP)로 에이전트에게 넘깁니다. 어떤 시스템이든 같은 방식으로 꽂힙니다."],
    ["agt", "③ 에너지 최적화 에이전트(A3)가 일을 맡고, 공간 지능 에이전트(A4)에게 내일 재실 예측을 묻습니다(A2A)."],
    ["orc", "④ 내부 서버의 작은 AI(SLM)가 절차를 짭니다. 온톨로지에서 '3층 회의실 = 냉방기 2대' 관계를 찾고, 어려운 판단만 큰 클라우드 모델에 맡깁니다."],
    ["dat", "⑤ 회의 일정, 재실, 온습도, 장비 상태 데이터를 같은 규격으로 읽습니다."],
    ["svc", "⑥ 가상 검증과 담당자 승인을 거쳐 냉방이 예약됩니다. 결과와 기록이 서비스로 돌아옵니다.", "done"]
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

export default async (request, context) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";

  if (!type.includes("text/html")) return response;

  let html = await response.text();

  html = html.replace("</head>", `
<style>
.brand img,.seal{
  filter:brightness(2.2) contrast(1.2) saturate(.9)
  drop-shadow(0 0 8px rgba(255,255,255,.65))
  drop-shadow(0 0 20px rgba(190,30,70,.5)) !important;
}
.osiris-music{
  position:fixed;
  right:18px;
  top:88px;
  z-index:99999;
  width:46px;
  height:46px;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.5);
  background:rgba(15,10,14,.9);
  color:white;
  font-size:20px;
  box-shadow:0 0 22px rgba(190,30,70,.35);
}
</style>
</head>`);

  html = html.replace("</body>", `
<script>
(function(){
  let ctx, gain, playing=false, timer;

  function music(){
    if(playing) return;
    playing=true;

    ctx=new (window.AudioContext||window.webkitAudioContext)();
    gain=ctx.createGain();
    gain.gain.value=.045;
    gain.connect(ctx.destination);

    const notes=[261.63,329.63,392,493.88,392,329.63];

    function play(){
      const osc=ctx.createOscillator();
      const g=ctx.createGain();

      osc.type="sine";
      osc.frequency.value=notes[Math.floor(Math.random()*notes.length)];

      g.gain.setValueAtTime(0,ctx.currentTime);
      g.gain.linearRampToValueAtTime(.7,ctx.currentTime+.3);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+2.5);

      osc.connect(g);
      g.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime+2.6);
    }

    play();
    timer=setInterval(play,1300);
  }

  function setup(){
    if(document.getElementById("osirisMusic")) return;

    const b=document.createElement("button");
    b.id="osirisMusic";
    b.className="osiris-music";
    b.innerHTML="♫";
    b.title="Ativar música";
    b.onclick=()=>{
      if(!playing) music();
    };

    document.body.appendChild(b);

    document.addEventListener("pointerdown",music,{once:true});
  }

  if(document.readyState==="loading")
    document.addEventListener("DOMContentLoaded",setup);
  else setup();
})();
</script>
</body>`);

  return new Response(html,response);
};

export const config={
  path:"/*",
  excludedPath:["/api/*","/.netlify/*"]
};

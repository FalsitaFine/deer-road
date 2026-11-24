// Only the plain encounter object crosses the save boundary. Actions below are rebuilt
// from that object each turn; their callbacks are never stored in it or sent to the UI.
const gearIds = ['hoof','tag','pad','window','pouch','muffle','shade','curtain','cup'];
const has = (e, id) => e.equipped.includes(id);
const say = (e, text) => e.log.push(text);
const act = (key, label, detail, run) => ({key,label,detail,run});
const view = (scene, ...choices) => ({scene, choices:choices.filter(Boolean)});
function finish(e, code, text) { e.done = true; e.outcome = code; e.summary = text; say(e,text); }

const stride = {
  title:'盐壳上的第四响', init:() => ({rod:'',heard:0,ache:0,rests:0,mark:''}),
  meters: e => [`四脚都听清的段数 ${e.heard}/3`,`肩酸 ${e.ache} 格 · 放架 ${e.rests} 次`,...(has(e,'tag')?[`验底签：${e.mark||'还没翻面'}`]:[])],
  turn(e) {
    if (!e.rod) return view('岑砧在左前扶稳头，乌筏扛着右前那根重梁。佟禾拿指节敲了敲你左后这截：「前三声老挤在一团。咱俩先顾哪头？」',
      act('listen','先听前三脚','贴着梁认声音；这小段由你负着。',()=>{e.rod='sound';e.ache=has(e,'pad')?0:1;say(e,'岑砧一顿，乌筏的短，佟禾那一声擦着皮边。你把第四声留给自己。');}),
      act('shoulder','先替佟禾换肩','歇一次，让她好腾出手，随后看她的布边报拍。',()=>{e.rod='hem';e.rests++;say(e,'佟禾把缀梅核的布边搭上你手背。提起来是尚未落脚，放平才轮到你。');}));
    const n=e.turn-1, need=['行','停','行'][n];
    const cues = e.rod==='sound'?['左前一顿、右前一短，皮边的第三声也响了。','乌筏的短音刚落，接着是梅核碰梁；佟禾那一脚还没下来。','岑砧把头一低。乌筏接了前脚，佟禾的长擦音到了。']:['布边已经在手背上摊平。岑砧还等着你。','梅核吊在指缝间，布边悬着；乌筏正在给佟禾腾肩。','梅核卧进掌心。佟禾松开手，岑砧的木角没有催你。'];
    const choose = (move,repeat=false) => {
      const correct=move===need;
      // The hollow hoof makes an early step distinguishable, not a fifth foot.
      const rescued=!correct && move==='行' && has(e,'hoof');
      if(correct || rescued) e.heard++;
      if(move==='停') e.rests++; else if(!has(e,'pad') || n===1) e.ache++;
      if(has(e,'tag')) e.mark=move; // single overwritten face, not a move history
      say(e,(repeat?'你摸了摸上一面的木纹。':'')+(rescued?'空心蹄抢先响出自己的两下。乌筏听出是你，停下来把佟禾漏的第三声让出来。':correct?(move==='停'?'你没抢那一点空。四个人都站定了，岑砧才松开腰杆。':'你晚半拍把第四声落实。架外一头鹿抬了脸。'):'这小段没听齐。佟禾用肩膀轻轻拱了你一下：「这一脚不欠到明天。」'));
      if(n===2) finish(e,e.heard>=2?'fourth':'shared',e.heard>=2?'过盐棚最后一道门槛时，岑砧没回头。他听见你过去了。':'最后一截，佟禾把布边分给你一半。四个人走着出了镇，不用回到起点练。');
    };
    return view(cues[n]+' 留给左后的，是这一下空。',
      act('step','补上第四响','前三脚齐了才落，不合时会盖过同伴。',()=>choose('行')),
      act('wait','把这一拍空着','给还没落下的脚腾地方；已经齐了，这一段就没第四响。',()=>choose('停')),
      has(e,'tag')&&e.mark&&act('invert','摸签，换上一拍的另一面','不出声给乌筏报变拍，省一次换肩；旧记号会被盖掉。',()=>{const move=e.mark==='行'?'停':'行'; const before=e.rests;choose(move,true);if(move==='停')e.rests=before;}));
  }
};

const ferry = {
  title:'渡簿上单独一个「到」', init:()=>({bank:false,young:false,load:'',trips:0,first:'',fare:0,waits:0,pocket:'',ink:false}),
  meters:e=>[`岸边见证：${e.bank?'看见尺痕':'尺痕未核'}／${e.young?'认到幼蹄':'幼蹄未核'}`,`幼鹿渡船 ${e.trips} 趟 · 船户等候 ${e.waits} 段 · 鹿班认下 ${e.fare} 份工`,...(has(e,'pouch')?[`浅腰囊：${e.pocket||'只容一件'}`]:[])],
  turn(e) {
    if(e.turn===0) return view('漆鸭嘴露得高，老木牌还朝左。岑砧收住鹿头，不拿旧牌作数。乌筏和她娘在前岸说话，佟禾替你把后帘的破洞撑圆。你先替谁作证？',
      act('尺','看正面的漆鸭','记下水尺搬过；背后的小鹿暂交给佟禾。',()=>{e.bank=true;say(e,'鸭嘴上有一线白痕。乌筏她娘说：「尺不搬，难道留在水里？」');}),
      act('蹄','看侧后两种蹄印',has(e,'window')?'半月耳窗一开，能同时听见佟禾；前头的尺被窗片遮住。':'不用耳窗，佟禾替你多守一段；前面的尺痕也等得到。',()=>{e.young=true;if(!has(e,'window')){e.waits++;e.bank=true;}say(e,'豁瓢已经过去，它自己的小鹿还站在这边。成鹿的印不能当幼鹿的数。');}));
    if(e.turn===1) return view('乌筏的船要摆小鹿，不让婚床和它们挤一趟。佟禾迎向床家，岑砧把空架腾开；岸上的人等你传哪句话。',
      act('receipt','给佟禾递一张工票',has(e,'pouch')?'把工票塞进唯一的浅囊，站着就递到后排；带不了渡簿。':'翻包找纸，迟一段；能直接认下抬床工。',()=>{e.load='bed';e.fare=1;e.pocket=has(e,'pouch')?'工票':'';if(!e.pocket)e.waits++;say(e,'佟禾把婚床误的工写给床家看。岑砧跟着出去搬。床脚朝哪头，留给新郎定。');}),
      act('slip','给乌筏递渡簿',has(e,'pouch')?'唯一的囊位留给渡簿；少耽搁一段，工票等靠岸再算。':'去取渡簿，迟一段；幼蹄的「到」有落笔处。',()=>{e.load='book';e.ink=true;e.pocket=has(e,'pouch')?'渡簿':'';if(!e.pocket)e.waits++;say(e,'乌筏的娘已经把婚床卸了。先见哪只上了船，就先记哪只；她没在簿头写一个大圈把两岸都画住。');}));
    if(e.turn===2) return view('豁瓢早已过河，来找它的小鹿自己走上船板。点地还在后头，没有跟上来。乌筏不拿成鹿的水深算幼鹿；这艘渡船怎么把两个「到」分开写？',
      act('together','留船多等一段，让小鹿自己凑一趟','少走一趟，但先到的那只要在船上等；迟床的工还得续记。',()=>{e.first='同趟';e.trips=1;e.waits++;e.fare++;say(e,'佟禾替抬婚床的人多记一段。等点地也踩上旧船板，乌筏才摆这一船；到岸时先后两行，各写各的。');}),
      act('apart','先送已经上船的，另留一趟给点地','渡两趟。已交工票便有余手接船；没交过票，得再请床家等。',()=>{e.first='分趟';e.trips=2;if(e.load!=='bed')e.waits++;say(e,'豁瓢的孩子先上岸抢茅花。乌筏再来一趟，等到点地也下了船，才把簿上的第二行画实。');}));
    const gap=!e.bank?'水尺':!e.young?'幼蹄':'';
    return view('靠岸了。点地的后蹄轻点一下，谁也认不准它是跟哪头母鹿来的。乌筏咬着笔尖：「咱们能签哪一行？」',
      act('verify',gap?`回岸补对${gap}`:'把两项见证合成对票','少一项就多等一段；两项齐了直接合票，把船钱、误工分别入账。',()=>{if(gap)e.waits++;e.bank=e.young=e.ink=true;e.fare=Math.max(1,e.fare);finish(e,'checked','岑砧将旧牌翻成空白。船钱、误工各占一行，幼鹿只记「到」，没写是谁的孩子。');}),
      act('leave','先交有见证的那一页',e.ink?'渡簿在手，现在就交；只落自己的名字。':'工票递出去了；渡簿得由乌筏回船取。',()=>{if(!e.ink)e.waits++;e.ink=true;finish(e,'open',`乌筏在「到」旁圈了一笔。${gap?gap+'那一栏今天不补。':'两项只在各自那页，不替别人合票。'}${e.fare?'抬床的工票随床上了坡。':'你另撕空票，把船户与床家分两行。'}`);}));
  }
};

const screen = {
  title:'把鹿角影留在布外',init:()=>({shadow:3,crush:3,oil:2,cloth:false,rest:0}),
  meters:e=>[`墙上角影 ${e.shadow}/3`,`晒席场拥挤 ${e.crush}/3`,`灯油 ${e.oil} 份 · 帘下歇班 ${e.rest} 班`],
  turn(e) {
    if(e.turn===0) return view('晒席场隔水照出一对高角。先到的鹿往回挤，末队的小蹄没地方放。岑砧不肯一下全黑；乌筏在后排看那条白泥印，佟禾把手伸向左肋旧缝。',
      act('lamp','岑砧先把一盏灯移低','角影矮两格；两盏灯还亮着，多耗一份油。',()=>{e.shadow-=2;e.oil--;say(e,'墙上的长角缩回一半；另一盏还照着来路。');}),
      act('call','你先报出后排的位置','空出一排肩，拥挤少两格；墙上的影暂时还在。',()=>{e.crush-=2;say(e,'后排听出这响在苇席边，不全往灯底下凑。乌筏看见白泥印挪到场边。');}));
    if(e.turn===1) return view('佟禾没递剪刀。她把自己补过的左侧布裁下来，整副竹肋还在。布只够先顾一头。',
      act('cut','先把角影隔断','角影归零；后排还要自己找到歇处。',()=>{e.cloth=true;e.shadow=0;say(e,'布一挂，两个角从墙上消失。佟禾手还在抖，线头却留得整齐。');}),
      act('bench','先让晒席场歇下一班','拥挤归零、歇班加一；还须把布移向灯间。',()=>{e.cloth=true;e.crush=0;e.rest++;say(e,'乌筏从场边让开，鹿自寻空处躺下。板凳空给人的，不是给点地的。');}));
    return view('天还没亮。岑砧望着墙，佟禾听着帘外反刍。最后半夜，谁接你的班？',
      act('wall','和岑砧守灯间','移布消尽角影，再用一份油看住来路。',()=>{e.shadow=0;e.oil--;endScreen(e);}),
      act('floor','和乌筏守晒席场','给后排再腾两格；留下的影得请守夜班移布。',()=>{e.crush=Math.max(0,e.crush-2);e.rest++;endScreen(e);}));
  }
};
function endScreen(e){const clear=!e.crush&&!e.shadow;finish(e,clear?'unhurried':'daybreak',clear?'天还黑着，前队已离开，后队安稳反刍。佟禾坐回凳上，说她今夜没晕。':e.shadow?'你守着后队，值夜班来搭手，才把布移到两盏灯之间。角影断了；多借的一班记在你的工上。':'前队走了，末排还挤。你们接着守到天亮，点地才在布外伸开腿。');}

const pass = {
  title:'旧墙间传来的半句话',init:()=>({sign:false,quiet:false,rolled:false,hoofNoise:false,checks:0,minute:0}),
  meters:e=>[`交到左后的证词：手势${e.sign?'已认':'未认'}／轻声${e.quiet?'已听':'未听'}`,`传话多等 ${e.minute} 拍 · 歇时查扣 ${e.checks} 轮`],
  turn(e){
    if(e.turn===0) return view('旧路尽头的木桩被落雪一个个藏起来。鹿班没动。墙这头岑砧的掌心一翻，墙那头乌筏的脚步一停。你留给这第一页哪种见证？',
      act('glare','等岑砧的掌影落稳',has(e,'shade')?'糖色眼沿下，白地里也能辨出他的手，不用再等；入阴处要卷起。':'等亮光过去再认，得多等一拍。',()=>{e.sign=true;if(!has(e,'shade'))e.minute++;say(e,'岑砧没比方向：掌心向下，是「这班到这里停」。');}),
      act('echo','听乌筏那一下停步',has(e,'hoof')?'空心蹄的尾音把外边的动静盖了；得看她走回来。':'架外的蹄声散了，乌筏还留在那儿；是等末队的意思。',()=>{if(has(e,'hoof')){e.hoofNoise=true;e.minute++;say(e,'多响那一下，没长出第五条腿。你没把听不清的写进去。');}else{e.quiet=true;say(e,'乌筏告诉你，是她先停，不是鹿群齐停。你认下了这一半。');}}));
    if(e.turn===1) return view('阴墙下，佟禾指指右肋上两根颜色相近的布头；一根是她补的扣，一根系着乌筏递的话。你只有空接一头。',
      act('voice','接乌筏的轻声，交给岑砧',has(e,'muffle')?'闷声套吃掉架扣的脆响，话不用重说；歇时须单查一次扣。':'架扣响在中间，佟禾得请乌筏重说一遍。',()=>{e.quiet=true;if(!has(e,'muffle'))e.minute++;say(e,'「末排还歇着。」佟禾接过这句话，写成一张小小的嘴，画了个叉。');}),
      act('hem','认清岑砧留下的手势布',has(e,'shade')?'墙下红褐难分，卷起眼沿，迟一拍再看。':'佟禾认得桃色缝线；她挑出手势布给你。',()=>{e.sign=true;if(has(e,'shade')){e.rolled=true;e.minute++;}say(e,'她翻过布面。掌心朝下的记号是岑砧留下的，不是叫大家快走。');}));
    return view('守棚人摊开空白纸。你们记的是这副架上四个人，不替旁人定山路。先前没看清的那一半，还要不要补问？',
      act('pair','把两半证词都交齐','少哪半问哪半，每半多等一拍；不留下猜的字。',()=>{e.minute+=Number(!e.sign)+Number(!e.quiet);e.sign=e.quiet=true;endPass(e);}),
      act('blank','只交亲见的记号','不再等；没认出的那半格空下来。',()=>endPass(e)));
  }
};
function endPass(e){if(has(e,'muffle')){e.checks++;e.minute++;say(e,'进歇棚才取下闷声套。松扣没发过响，佟禾专门留一轮摸过旧缝。');}finish(e,e.sign&&e.quiet?'paired':'half',e.sign&&e.quiet?'守棚人把「架已停」和「末排歇着」分两行记下。灶屋给最后四位留了凳子。':'守棚人把没认出的那格留白，另请值夜班接话。你们照样进灶屋分饼。');}

const fodder = {
  title:'两道草，五家的票',init:()=>({now:0,later:0,visits:0,haul:0,sew:0,wage:0,who:'',receipt:''}),
  meters:e=>[`上秤两道：今夜 ${e.now}／路口留 ${e.later} · 底下红泥四道封存`,`春车留位 ${e.haul} 格 · 帐帘 ${e.sew} 幅 · 预留渡工 ${e.wage} 份`,`登门 ${e.visits}/5 户${e.receipt?' · '+e.receipt:''}`],
  turn(e){
    if(e.turn===0) return view('荀葵把秤杆横给你：十五道，最底下四道红泥，是四月的羊，谁签字也不能动。只借最上两道给末队。乌筏拿空碗当秤盘，问你今夜往哪边拨。',
      act('split','今夜一道，路口暂存一道','少开一捆，明日要再找人一起上秤。',()=>{e.now=1;e.later=1;e.who='tomorrow';say(e,'你劈开两张秤签，一张留到明日。荀葵没收空口许下的盐栈钱。');}),
      act('both','两道今夜一起上秤','省去明日复秤；鹿班得留人看住路口的份，不能拿来收大群。',()=>{e.now=2;e.who='night';say(e,'两个碗并排，鹿班留夜班看秤。岑砧把大群留在松坡那条路上，不把这点草许出去。');}));
    if(e.turn===1) return view('前三家愿借，得让每家认得春天拿哪半张来兑。第四家不借，荀葵把门扣还给他们。乌筏说：「我只签得到自己的渡工。」',
      act('cart','让春车多留一格给补草','鹿班留一份渡工，春车多一格少运别的东西。',()=>{e.visits=4;e.haul=2;e.wage=1;say(e,'乌筏把自己能留的一份渡工按住。你只在春车能留空的两格上画了草叉。第四家那行没写欠字。');}),
      act('wages','鹿班再留一份渡工','少占一格春车，多摊一份自家的工；不许诺草价。',()=>{e.visits=4;e.haul=1;e.wage=2;say(e,'你在乌筏名字下也按了指印。退到一格春车的空位，账上找得到拿工抵的两个人。');}));
    if(e.turn===2) return view('第五家不要车位，拿出两块光秃秃的帐门。佟禾握了握手指，答应缝两幅。她娘想换的两扇窗，纸样只能带走一扇。你理的不是再借多少，是哪一班工来接她。',
      act('cover','你接佟禾的秤班',e.who==='night'?'今夜你守秤，佟禾今晚先裁。':'明日你来复秤，佟禾明早先裁。',()=>{e.visits++;e.sew=2;e.receipt=e.who==='night'?'你守夜秤':'你明日复秤';say(e,'佟禾把留下的窗样夹进你的半张票里，免得回头两个人都忘记。');}),
      act('draw','请岑砧接班；你替他画路牌','你去写松坡与末队的两行，岑砧把自己那班签上。',()=>{e.visits++;e.sew=2;e.receipt=e.who==='night'?'岑砧守夜秤':'岑砧明日复秤';say(e,'岑砧把黑板给你，自己挨着草秤坐下。两幅帐帘由第五家收票；第四家的门不再敲。');}));
    return view('春车、工和两幅帘子都已有主，鹿看不懂路牌。岑砧等能走的大鹿先散，乌筏在渡簿里空着亲缘一栏。两边各收半票，给查账的人先看哪一行？',
      act('house','把帐帘工写在骑缝正面','交给草户先对帘数。',()=>finish(e,'house',`两半一合，是两幅帐帘。${e.receipt}；两道草止在红泥之上。旧泉没有重新变暖。`)),
      act('crew','把鹿班的工写在骑缝正面','交给接班人先对工数。',()=>finish(e,'crew',`两半一合，是${e.wage===2?'两':'一'}份渡工。${e.receipt}；两道草给这一小拨，不替全谷过冬。`)));
  }
};

const rear = {
  title:'换位之后，谁报最后一脚',init:equipped=>({phase:'beam',ache:2,stops:0,beats:0,rear:false,cloth:false,drink:equipped.includes('cup')?'满盏':'未带',pack:equipped.includes('cup')?'暖盏':'余一格'}),
  meters:e=>[`左前：你／右前：乌筏／右后：佟禾／左后：岑砧`,`肩酸 ${e.ache} 格 · 歇过 ${e.stops} 段 · 行程 ${e.beats} 拍`,`随包：${e.pack} · ${e.cloth?'帘垂着，看不见侧地':'帘已收'} · ${e.rear?'听见最后一脚':'还在等回音'}`],
  turn(e){
    if(e.phase==='beam') return view('鹿首在你额头上。乌筏用肩托着最重的梁，岑砧在你原先的洞眼后坐定。东隙午阳晒在皮背上，你们要走在末排的后面，不替它选脚印。',
      act('long','和乌筏负过这一长段',has(e,'pad')?'蓝牙垫肩省一格肩酸；棉垫捂热，先歇一段再到停处。':'这一段两格肩酸，到停处才卸。',()=>{e.beats++;e.ache+=has(e,'pad')?1:2;if(has(e,'pad'))e.stops++;e.phase='pause';say(e,'你先问乌筏站好没有。她肩膀往上顶了一下，你才敢把角扶正。');}),
      act('short','把长段拆成两拍','不吃两格酸；两拍之间就放架歇，末队仍在前。',()=>{e.beats+=2;e.stops++;e.ache++;e.phase='pause';say(e,'放架的时候，岑砧没催。他在左后，把靴里一颗梅核倒了出来。');}));
    if(e.phase==='pause') {
      const rest=(n,txt)=>{e.ache=Math.max(0,e.ache-n);e.stops++;e.phase='listen';say(e,txt);};
      return view('点地停了。佟禾也跟着坐下，说：「它什么时候走，不用问我。你倒是该顾顾自己这副肩膀。」歇处只够做一件事。',
        act('rest','把架子搁下，四个人分一张凳','歇一段，卸一格肩酸；留出侧面的视线。',()=>rest(1,'佟禾往边上匀了半个屁股，这回连乌筏也坐得下。')),
        has(e,'curtain')&&act('cloth','佟禾垂下等候帘','帘替歇班挡风，卸两格酸；看不见侧地，走前必须专收一拍。',()=>{e.cloth=true;rest(2,'桃线挡住一层风。岑砧在帘里歇好了，没隔着布替你报脚印。');}),
        e.drink==='满盏'&&act('sip','把凹盖里的热饮分给迟到的人','卸三格肩酸；只这一份，喝完空盏仍占位。',()=>{e.drink='空盏';e.pack='空盏';rest(3,'盖子还是温的。乌筏给错过饭的佟禾留了一口，佟禾拿指头把空盏弹得叮一声。');}),
        e.pack==='余一格'&&act('chalk','用空着的行囊格收后排的记号片','歇这一段不卸酸；左后的位置有凭，不必再回身确认。',()=>{e.pack='后排记号片';e.rear=true;rest(0,'岑砧把刻了指窝的木片放到空格。新左后也知道，要让你认出是他。');}));
    }
    if(e.cloth) return view('左肋垂着布，点地的那侧看不见。佟禾把桃线送进你掌心，先收帘，再走。',
      act('roll','你接住帘，让乌筏问左后','收帘用一拍；肩上多扛一格，换来岑砧的回音。',()=>{e.cloth=false;e.beats++;e.ache++;e.rear=true;say(e,'布卷回架里。乌筏问后排，岑砧敲了两下表示自己在。');}),
      act('fold','让佟禾收，你把角挪开','收帘仍用一拍，不添肩酸；最后那脚还须听。',()=>{e.cloth=false;e.beats++;say(e,'佟禾折好了去年的桃色线。你把假鹿的下巴从点地后脑勺边挪开。');}));
    const listenBeats=e.rear?0:e.ache>=3?2:1;
    return view('木下巴挪开，岸沿就露出来了。点地自己撒了泡尿，自己上了岸。乌筏还在笑；怎么知道四个人也都过来了？',
      act('hear','留出一拍给新左后',e.rear?'已经接过记号，岑砧循着约定补第四声。':listenBeats===2?'肩还酸着，梁音打颤；请岑砧再报一遍，等两拍。':'肩已缓过来，单等一拍就听清。',()=>{e.beats+=listenBeats;e.rear=true;finish(e,'reply','晚一点的空响从你身后落下。这回给你报最后一脚的人，叫岑砧。');}),
      act('look','和佟禾回身认四个人','放架点清，添一次歇脚；不必隔着木头猜。',()=>{e.stops++;e.ache=Math.max(0,e.ache-1);e.rear=true;finish(e,'faces','末队已经去啃矮柳。你回头数的是人，不是鹿：四双鞋上岸，一双也没少。');}));
  }
};

const paper = {
  title:'纸鹿少一条腿',init:()=>({head:'',legs:3,bows:0,ticket:''}),
  meters:e=>[`灯下纸腿 ${e.legs}/4 · 昂头 ${e.bows} 次`,`灯戏 ${Math.min(e.turn+1,3)}/3 折${e.ticket?' · 票背：'+e.ticket:''}`],
  turn(e){
    if(e.turn===0) return view('一方灯布，四个人围桌，各管原位那条纸腿。岑砧先转纸头；乌筏守着右前那条，朝布上数。孩子们等一头会坐的鹿。',
      act('door','请岑砧把头朝纸门','门在你的左手边，地上的亮缝也在左边。',()=>{e.head='door';say(e,'纸头朝门。乌筏数出三条影；你和佟禾的两条叠着，左边还有一道亮缝。');}),
      act('bench','让纸头回望板凳','板凳在右手边，左边是叠在一起的暗纸。',()=>{e.head='bench';say(e,'纸头向凳子扭回来。灯布上还是三条；左边一团黑，右边才是露白的空档。');}));
    if(e.turn===1) return view('佟禾正要报哪两条叠了。你是把这句听完，还是抢着让纸鹿昂一次头？照灯的姐姐已经举起两根手指。',
      act('wait','等佟禾说完，和她错开','四条各占一道缝；这一折来不及昂头。',()=>{e.legs=4;say(e,'「你这张先别动。我往门边去。」佟禾让出那条细缝，乌筏从一数到四。');}),
      act('early','先往左动自己的纸腿','赚一次昂头；左边若没空档，只会换一条腿被盖住。',()=>{e.bows++;e.legs=e.head==='door'?4:3;say(e,e.legs===4?'空档正好在门边。岑砧抬纸头，四条腿一齐露出来。':'左后露出来，右后却给遮住了。那一下昂头倒很好看。');}));
    return view(e.legs===4?'乌筏报「四！」佟禾托着两张分开的后腿。最后一折，趁这个样子坐下，还是再演一个笑话？':'乌筏一根一根指：还少佟禾那条。弟弟把手放到幕后，说少腿的戏他也会接。',
      act('seat',e.legs===4?'四人照原样把纸鹿放坐':'让佟禾移向亮缝再坐','听清报数再落座；少演一次昂头，换一张墨杠票。',()=>{e.legs=4;e.ticket='四道墨杠';finish(e,'bars','纸鹿四脚分明地一屁股坐下。弟弟在票背画了四道墨杠：「这回没夹着我的手。」');}),
      act('bow','岑砧再昂头，后腿照现在的位置坐','不再挪后腿。若还少一条，让弟弟登台。',()=>{e.bows++;if(e.legs===4){e.ticket='四道墨杠';finish(e,'bars','纸鹿昂头，又把四条纸腿屈成一个坐相。弟弟给你们的票添了四道墨杠。');}else{e.ticket='一枚指印';finish(e,'finger','弟弟从幕后伸出食指补上：「客官，这条腿还会剥豆。」掌声一样响，票上收下一枚指印。');}}));
  }
};

const scripts = new Map(Object.entries({stride,ferry,screen,pass,fodder,rear,paper}));
const actionId=(e,key)=>`${e.id}:${e.turn}:${key}`;
export function startEncounter(id,equipped=[]) {
  const script=scripts.get(id); if(!script) throw new RangeError(`Unknown encounter: ${id}`);
  const items=gearIds.filter(g=>Array.isArray(equipped)&&equipped.includes(g));
  return {id,equipped:items,turn:0,log:[],done:false,outcome:'',summary:'',...script.init(items)};
}
export function describeEncounter(e) {
  const script=scripts.get(e?.id); if(!script) return null;
  const v=e.done?view(e.summary):script.turn(e);
  return {title:script.title,scene:v.scene,meters:script.meters(e),actions:v.choices.map(({key,label,detail})=>({id:actionId(e,key),label,detail})),log:[...e.log],done:e.done};
}
export function playEncounter(e,id) {
  const script=scripts.get(e?.id); if(!script || e.done) return e;
  const item=script.turn(e).choices.find(c=>actionId(e,c.key)===id);
  if(item){item.run();e.turn++;} // Replayed clicks and stale UI actions cannot advance another turn.
  return e;
}

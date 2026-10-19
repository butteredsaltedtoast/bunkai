const cases = [
    ["わたしはにほんごをべんきょうしています", "私は日本語を勉強しています"],
    ["わたしはねこがすきです", "私は猫が好きです"],
    ["わたしのかさはどこですか", "私の傘はどこですか"],
    ["まいにちあさごはんをたべます", "毎日朝ごはんを食べます"],
    ["このしろいぼうしがほしいです", "この白い帽子が欲しいです"],
    ["いぬがすきです", "犬が好きです"],
    ["ともだちとえいがをみます", "友達と映画を見ます"],
    ["あのくつがほしいです", "あの靴が欲しいです"],
    ["ははとはなします", "母と話します"],
    ["ちちとやきゅうをします", "父と野球をします"],
    ["きょうはあさからあめがふっています", "今日は朝から雨が降っています"],
    ["ともだちとこうえんへいきました", "友達と公園へ行きました"],
    ["まいにちみずをのみます", "毎日水を飲みます"],
    ["このほんはおもしろかった", "この本は面白かった"],
    ["がっこうでせんせいとはなしました", "学校で先生と話しました"],
    ["でんしゃでかいしゃにいきます", "電車で会社に行きます"],
    ["あしたはやすみです", "明日は休みです"],
    ["へやがひろいです", "部屋が広いです"],
    ["みせでくだものをかいました", "店で果物を買いました"],
    ["よるはテレビをみます", "夜はテレビを見ます"],
];

/*
    the reason we need these "fresh" arrays is for the following reason!!
    basically. every time i run a test and something goes wrong and i go fix it.
    i have now kind of "tuned" it to work for that specific case, and the score goes up by 1.
    HOWEVER
    this isn't really honest to how accurate the extension is!
    what if it only works on the test sentences? or what if there's an entirely different problem not covered by the test?
    that's why i wrote these fresh tests with sentences that AREN'T in tatoeba.
    (because the n-gram model learned from tatoeba. it's gonna get it right if it's in tatoeba.)

    TLDR;
    every time i fix bugs from a set, it gets kind of 'used up.'
    they're to test on never-before seen sentences to avoid inflated scores
    and that's why there's multiple!
    i need to write another every time i fix problems from one.
*/

const fresh = [
    ["あにはぎんこうではたらいています", "兄は銀行で働いています"],
    ["きのうはともだちのいえにとまりました", "昨日は友達の家に泊まりました"],
    ["きょねんのふゆはとてもさむかった", "去年の冬はとても寒かった"],
    ["えきのまえでいもうとをまちました", "駅の前で妹を待ちました"],
    ["あたらしいくるまをかいたいです", "新しい車を買いたいです"],
    ["せんせいにてがみをかきました", "先生に手紙を書きました"],
    ["たなのうえにはこがあります", "棚の上に箱があります"],
    ["こどもたちがこうえんであそんでいます", "子供たちが公園で遊んでいます"],
    ["ドアをしめてもいいですか", "ドアを閉めてもいいですか"],
    ["あねはびょういんではたらいています", "姉は病院で働いています"],
    ["あめがやんだらそとであそびましょう", "雨が止んだら外で遊びましょう"],
    ["ちちはまいあささんぽをします", "父は毎朝散歩をします"],
    ["このみせのラーメンはやすくておいしい", "この店のラーメンは安くておいしい"],
    ["らいしゅうしけんがあります", "来週試験があります"],
    ["おとうとといっしょにうみでおよぎました", "弟と一緒に海で泳ぎました"],
];

const fresh2 = [ // i decided i'm adding meaning comments to these, starting now.
    ["まいばんおふろにはいります", "毎晩お風呂に入ります"], // i take a bath every night
    ["そらがとてもあおいです", "空がとても青いです"], // the sky is very blue
    ["ははがおいしいケーキをつくりました", "母がおいしいケーキを作りました"], // my mom made a tasty cake
    ["としょかんでほんをかりました", "図書館で本を借りました"], // i borrowed a book at the library
    ["ちかてつはとてもべんりです", "地下鉄はとても便利です"], // the subway is very convenient
    ["ねこがいすのしたでねています", "猫が椅子の下で寝ています"], // the cat is sleeping under the chair
    ["かぜをひいてがっこうをやすみました", ["風邪を引いて学校を休みました", "風邪をひいて学校を休みました"]], // i caught a cold and missed school
    ["あたらしいくつをはきたいです", "新しい靴を履きたいです"], // i want to wear new shoes
    ["きょうはさむいのでコートをきます", "今日は寒いのでコートを着ます"], // it's cold today so i'll wear a coat
    ["おとうとはまいにちゲームをしています", "弟は毎日ゲームをしています"], // my little brother plays games every day
    ["えきまであるいていきました", "駅まで歩いて行きました"], // i walked to the station
    ["このりょうりはちょっとからいです", "この料理はちょっと辛いです"], // this food is a little spicy
];

const fresh3 = [
    ["しゅうまつにやまにのぼりました", "週末に山に登りました"], // i climbed a mountain on the weekend
    ["かのじょはうたがじょうずです", "彼女は歌が上手です"], // she's good at singing
    ["このにもつはおもいです", "この荷物は重いです"], // this luggage is heavy
    ["あしたはやくおきなければなりません", "明日早く起きなければなりません"], // i have to wake up early tomorrow
    ["いもうとはピアノをひいています", "妹はピアノを弾いています"], // my little sister is playing piano
    ["てがみをおくりたいです", "手紙を送りたいです"], // i want to send a letter
    ["ちちはしんぶんをよんでいます", "父は新聞を読んでいます"], // my dad is reading the newspaper
    ["そとはとてもしずかです", "外はとても静かです"], // it's very quiet outside
    ["あさごはんのあとでさんぽします", ["朝ごはんの後で散歩します", "朝ご飯の後で散歩します"]], // i take a walk after breakfast
    ["あたまがいたいのでやすみます", "頭が痛いので休みます"], // i have a headache so i'll rest
    ["あにはくるまをうんてんしています", "兄は車を運転しています"], // my older brother is driving
    ["だいどころでりょうりをつくっています", "台所で料理を作っています"], // i'm cooking in the kitchen
];

const fresh4 = [ // test for multi-split beam!!!
    ["まいしゅうどようびにテニスをします", "毎週土曜日にテニスをします"], // i play tennis every saturday
    ["えきのちかくにあたらしいみせができました", "駅の近くに新しい店ができました"], // a new store opened up near the station
    ["あねはだいがくでれきしをべんきょうしています", "姉は大学で歴史を勉強しています"], // my older sister studies history at college
    ["きのうのよるははやくねました", "昨日の夜は早く寝ました"], // i went to bed early last night
    ["このかわはとてもふかいです", "この川はとても深いです"],　// this river is very deep
    ["そぼにてがみをかきました", "祖母に手紙を書きました"],　// i wrote a letter to my grandma
    ["まどからうみがみえます", "窓から海が見えます"],　// you can see the sea from the window
    ["おとうとはいぬのさんぽにいきました", "弟は犬の散歩に行きました"],　// my little brother went to walk the dog
    ["けさはゆきがふっています", "今朝は雪が降っています"],　// it was snowing this morning
    ["らいげつきょうとへりょこうします", "来月京都へ旅行します"], // i'm travelling to kyoto next month
    ["せんせいのはなしはとてもながかった", "先生の話はとても長かった"],
    ["こうえんでしゃしんをとりました", "公園で写真を撮りました"],
]

// that's all the tests for now... more coming soon perhaps?

module.exports = {cases, fresh, fresh2, fresh3, fresh4};
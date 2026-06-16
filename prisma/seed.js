const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 既存データの削除（デバッグ時の重複防止、カスケード削除）
  await prisma.gallery.deleteMany({});
  await prisma.movie.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.news.deleteMany({});

  // 1. メンバーデータの登録
  const ren = await prisma.member.create({
    data: {
      name: '黒鉄 レン',
      slug: 'ren-kurogane',
      reading: 'くろがね れん',
      iconImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=400&h=400&q=80', // サイバー感のある男性イラスト風
      headerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&h=600&q=80', // eスポーツアリーナ
      description: '「余りモノ」のリーダー。圧倒的なエイム力と冷徹な判断力でチームを勝利に導くFPSモンスター。普段は無口だが、ゲーム中やリスナーとのプロレスでは熱くなる一面も。',
      favoriteGame: 'VALORANT, Apex Legends',
      color: '#7C3AED', // 紫
      birthday: '10月24日',
      height: '178cm',
      hobby: 'バイク、筋トレ、エナジードリンクの飲み比べ',
      youtube: 'https://youtube.com/c/example-ren',
      twitch: 'https://twitch.tv/example-ren',
      twitter: 'https://twitter.com/example-ren',
      tiktok: 'https://tiktok.com/@example-ren',
      fanName: 'レンゾク魔',
      hashtag: '#レン起動中',
      career: JSON.stringify([
        { date: '2024.04', title: '「余りモノ」結成、リーダーに就任' },
        { date: '2024.09', title: 'VALORANTコミュニティ大会「CyberCup」優勝' },
        { date: '2025.02', title: 'YouTubeチャンネル登録者数 30万人突破' },
        { date: '2025.11', title: 'ストリーマーフェス2025 メインステージ出演' }
      ]),
      gallery: {
        create: [
          { image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&h=500&q=80', order: 1 },
          { image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&h=500&q=80', order: 2 }
        ]
      },
      movies: {
        create: [
          { youtubeId: 'dQw4w9WgXcQ', title: '【VALORANT】これが余りモノ流！最強の連携で立ち回るランクマッチ【黒鉄レン】' },
          { youtubeId: 'dQw4w9WgXcQ', title: '【歌ってみた】ネオンサイン・サイバーパンク / 黒鉄レン Cover' }
        ]
      }
    }
  });

  const mia = await prisma.member.create({
    data: {
      name: '白咲 みあ',
      slug: 'mia-shirasaki',
      reading: 'しらさき みあ',
      iconImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80', // 女性アイコン風
      headerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&h=600&q=80', // ネオンサイン背景
      description: '透き通るようなクリスタルボイスを持つグループのメインボーカル。マイペースでおっとりしているが、歌い出すと表情が一変する。マイクラの建築センスが壊滅的なことで有名。',
      favoriteGame: 'Minecraft, 原神, 崩壊:スターレイル',
      color: '#EC4899', // ピンク
      birthday: '3月15日',
      height: '152cm',
      hobby: '作詞・作曲、可愛いカフェ巡り、長風呂',
      youtube: 'https://youtube.com/c/example-mia',
      twitch: 'https://twitch.tv/example-mia',
      twitter: 'https://twitter.com/example-mia',
      instagram: 'https://instagram.com/example-mia',
      fanName: 'みあしす',
      hashtag: '#みあのおと',
      career: JSON.stringify([
        { date: '2024.04', title: '「余りモノ」の初期メンバーとして活動開始' },
        { date: '2024.07', title: '1st オリジナルシングル「グラス・ネオン」リリース' },
        { date: '2024.12', title: 'ソロ音楽ライブ「MIA 1st Live - Crystal -」開催' },
        { date: '2025.05', title: 'チャンネル登録者数 50万人突破' }
      ]),
      gallery: {
        create: [
          { image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&h=500&q=80', order: 1 },
          { image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&h=500&q=80', order: 2 }
        ]
      },
      movies: {
        create: [
          { youtubeId: 'dQw4w9WgXcQ', title: '【オリジナルMV】グラス・ネオン / 白咲みあ【Official】' },
          { youtubeId: 'dQw4w9WgXcQ', title: '【Minecraft】リスナーと作る！ネオン輝く巨大観覧車ビルド！【白咲みあ】' }
        ]
      }
    }
  });

  const kanato = await prisma.member.create({
    data: {
      name: '碧川 カナト',
      slug: 'kanato-aokawa',
      reading: 'あおかわ かなと',
      iconImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80', // クール男性風
      headerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&h=600&q=80', // テクノロジー・基盤背景
      description: '驚異的な知識量と圧倒的なゲームスピードを誇る戦術の天才。元プロゲーマーで、グループの戦術アドバイザーも兼任。冷静沈着に見えるが、大好物のラーメンを前にするとIQが急激に下がる。',
      favoriteGame: 'League of Legends, VALORANT, 格闘ゲーム全般',
      color: '#06B6D4', // 水色
      birthday: '8月8日',
      height: '174cm',
      hobby: 'ラーメン屋巡り、自作PCのカスタマイズ、ガジェット収集',
      youtube: 'https://youtube.com/c/example-kanato',
      twitch: 'https://twitch.tv/example-kanato',
      twitter: 'https://twitter.com/example-kanato',
      tiktok: 'https://tiktok.com/@example-kanato',
      fanName: '碧星観測隊',
      hashtag: '#カナトの解析度',
      career: JSON.stringify([
        { date: '2024.06', title: '「余りモノ」へ電撃加入' },
        { date: '2024.10', title: '「LoL ストリーマーズShowdown」にてMVP獲得' },
        { date: '2025.01', title: '自作ゲーミングPC解説動画が100万回再生突破' },
        { date: '2025.06', title: 'Twitch同時接続者数 2万人達成' }
      ]),
      gallery: {
        create: [
          { image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&w=800&h=500&q=80', order: 1 },
          { image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&h=500&q=80', order: 2 }
        ]
      },
      movies: {
        create: [
          { youtubeId: 'dQw4w9WgXcQ', title: '【LoL】初心者でも分かる！マップコントロールと勝率を10%上げる戦術解説【碧川カナト】' },
          { youtubeId: 'dQw4w9WgXcQ', title: '【雑談】深夜の神山二郎系ラーメン巡り、究極の一杯を求めて【碧川カナト】' }
        ]
      }
    }
  });

  const nene = await prisma.member.create({
    data: {
      name: '桃瀬 ねね',
      slug: 'nene-momose',
      reading: 'ももせ ねね',
      iconImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80', // 明るい女性アイコン風
      headerImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&h=600&q=80', // ピンク・紫のグラデーション背景
      description: '元気いっぱいのポメ系ストリーマー。誰とでもすぐに仲良くなれる驚異的なコミュ力を持つ。ホラーゲームがとにかく苦手で、悲鳴が爆音すぎてリスナーの鼓膜を破壊しがち。',
      favoriteGame: 'モンスターハンター, あつまれ どうぶつの森, Party Games',
      color: '#EAB308', // 黄色
      birthday: '12月1日',
      height: '148cm',
      hobby: 'お菓子作り、海外アニメ鑑賞、実家の犬と遊ぶ',
      youtube: 'https://youtube.com/c/example-nene',
      twitter: 'https://twitter.com/example-nene',
      tiktok: 'https://tiktok.com/@example-nene',
      instagram: 'https://instagram.com/example-nene',
      fanName: 'ねねち組',
      hashtag: '#ねねちに届け',
      career: JSON.stringify([
        { date: '2024.04', title: '「余りモノ」の初期メンバーとして活動開始' },
        { date: '2024.08', title: '24時間耐久配信「あつ森 島クリエイト」を完走' },
        { date: '2025.03', title: 'アパレルブランド「NeonCute」とのコラボグッズ発売' },
        { date: '2025.04', title: 'YouTubeチャンネル登録者数 25万人突破' }
      ]),
      gallery: {
        create: [
          { image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&h=500&q=80', order: 1 },
          { image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&h=500&q=80', order: 2 }
        ]
      },
      movies: {
        create: [
          { youtubeId: 'dQw4w9WgXcQ', title: '【爆笑】絶叫注意！世界一びびりな奴が本気で挑むサイコホラーゲーム【桃瀬ねね】' },
          { youtubeId: 'dQw4w9WgXcQ', title: '【実写/カメラ】プロ直伝！簡単マカロンをみんなで一緒に作ろう配信【桃瀬ねね】' }
        ]
      }
    }
  });

  // 2. ニュースデータの登録
  await prisma.news.create({
    data: {
      title: '原田ダダスケ主催のストリーマーグループ「余りモノ」公式サイトオープン！',
      slug: 'site-open',
      thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&h=450&q=80',
      content: `### 「余りモノ」公式ホームページが遂にオープン！

いつも「余りモノ」を応援いただきありがとうございます。
この度、原田ダダスケ主催のストリーマーグループ「余りモノ」の公式ホームページをオープンいたしました！

デザインは、グループのロゴにマッチしたハチャメチャでポップなスタイルで構築。
MEMBERページでは、各メンバーの詳細プロフィールや経歴、ギャラリー、最新の配信動画を一覧で確認することができます。

今後、メンバーの個人活動情報やグッズ情報など、様々なニュースをこちらから発信してまいります。
ぜひブックマークに登録して、定期的にチェックしてください！

---

#### グループ概要
- **グループ名**: 余りモノ
- **主催**: 原田ダダスケ
- **発足**: 2025年9月
- **所属ストリーマー**: 黒鉄レン, 白咲みあ, 碧川カナト, 桃瀬ねね

今後とも「余りモノ」の応援をよろしくお願いいたします！`
    }
  });

  await prisma.news.create({
    data: {
      title: '「余りモノ」1st 公式ポップアップストア & 限定グッズ販売決定！',
      slug: 'goods-popup-store',
      thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&h=450&q=80',
      content: `### 初の限定アパレル＆グッズがPOP-UPストアに登場！

「余りモノ」活動開始を記念し、グループ初のリアルPOP-UPストアおよびECストアでの公式グッズ販売が決定いたしました！

今回のグッズは、ロゴデザインを担当した気鋭のデザイナーとコラボレーションした、ストリートファッション調のアパレルアイテムやネオンアクリルキーホルダー、缶バッジなど、ハチャメチャでスタイリッシュなラインナップとなっております。

#### 開催概要
- **場所**: 渋谷サイバーガレージ 2F 特設会場
- **期間**: 2025年7月10日(木) 〜 2025年7月16日(水)
- **営業時間**: 11:00 〜 20:00

#### 販売アイテム例
- **「AMARIMONO」サイバーコーチジャケット (Black)**: ¥8,800 (税込)
- **メンバーネームアクリルキーホルダー (全4種)**: 各¥1,200 (税込)
- **オリジナルロゴステッカーパック**: ¥800 (税込)

#### 特典情報
会場にて一度のお会計で合計 ¥5,000 以上お買い上げいただいたお客様に、メンバーの直筆サイン入りポストカード（ランダム全4種）を1枚プレゼントいたします。

皆様のご来場、心よりお待ちしております！`
    }
  });

  await prisma.news.create({
    data: {
      title: '「余りモノ」全員集合！夏の24時間ゲーム耐久生放送配信決定！',
      slug: 'summer-24h-stream',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&h=450&q=80',
      content: `### 「余りモノ」が送る、この夏最大の熱狂！

今年もやってきました！メンバー4名が全員集合し、様々なゲームタイトルに挑戦する「夏の24時間ゲーム耐久生放送」の配信が決定いたしました！

今回のテーマは **「余りモノには福がある」**。
さまざまなゲームでハチャメチャなミッションをクリアし、リスナーへの豪華プレゼントを獲得するための24時間ぶっ通しチャレンジです。

#### 配信概要
- **配信日時**: 2025年8月2日(土) 18:00 〜 8月3日(日) 18:00
- **配信プラットフォーム**: メンバー各員の公式配信チャンネル

#### タイムスケジュール（予定）
- **18:00 〜 21:00**: 開会式 ＆ 全員参戦！マリオカート最強決定戦
- **21:00 〜 02:00**: 黒鉄レン ＆ 碧川カナトのVALORANT深夜ランク耐久
- **02:00 〜 06:00**: 白咲みあ ＆ 桃瀬ねねの恐怖絶叫！深夜ホラーゲームラッシュ
- **06:00 〜 11:00**: 朝のマイクラ建築バトル！「理想のシェアハウス」
- **11:00 〜 15:00**: 視聴者参加型！モンハン特別討伐ミッション
- **15:00 〜 18:00**: グランドフィナーレ！全ミッション制覇なるか！？

深夜帯のコラボやハチャメチャなペナルティゲームなど、見逃せない企画が盛りだくさんです。
ぜひ一緒に熱い24時間を過ごしましょう！`
    }
  });

  console.log('Seeding database completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

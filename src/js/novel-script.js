// Prescription の台本（テキスト）を、ノベルゲームの手順（ステップ）の列に変換する。
// 書き方は src/scenario/prescription.txt の先頭を参照。
//
// ステップの種類
//   { type: 'text', speaker, text }  … 1 回のクリックで出す文（speaker は名札。地の文は ''）
//   { type: 'chapter', title }       … 章の始まり
//   { type: 'page' }                 … 空行。NVL では改ページ
//   { type: 'bg' | 'mode' | 'end' …, args, line } … @ で始まる命令

// 「名前「台詞」」「名前『台詞』」の形。名前は行頭から 12 文字まで。
// 空白・句読点・かっこを含むものは名前ではなく、地の文として扱う
const SPEECH = /^([^\s「『」』、。]{1,12})([「『].*[」』])$/;

export const parseScript = function (source) {
  const steps = [];
  source.split(/\r?\n/).forEach((raw, i) => {
    // 行頭の全角スペース（段落の字下げ）は本文の一部なので残す
    const line = raw.replace(/^[ \t]+|\s+$/g, '');
    if (line.startsWith(';')) return;
    if (line === '') {
      steps.push({ type: 'page' });
    } else if (line.startsWith('#')) {
      steps.push({ type: 'chapter', title: line.slice(1).trim() });
    } else if (line.startsWith('@')) {
      const [type, ...args] = line.slice(1).trim().split(/\s+/);
      steps.push({ type, args, line: i + 1 });
    } else {
      const speech = line.match(SPEECH);
      steps.push(
        speech
          ? { type: 'text', speaker: speech[1].trim(), text: speech[2] }
          : { type: 'text', speaker: '', text: line }
      );
    }
  });
  // 空行が続いたときや、最初の空行は 1 つにまとめる
  return steps.filter(
    (step, i) => step.type !== 'page' || (i > 0 && steps[i - 1].type !== 'page')
  );
};

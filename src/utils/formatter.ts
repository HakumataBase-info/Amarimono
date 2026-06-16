/**
 * 簡易的なMarkdown文字列をHTMLにパースするヘルパー
 * (外部の重いライブラリを入れず、安全に基本タグをレンダリングする)
 */
export function parseMarkdown(markdown: string): string {
  let html = markdown;

  // XSS対策の基本サニタイズ
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 見出し
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold text-white mt-8 mb-4 tracking-wide border-l-2 border-cyan-400 pl-3">$1</h3>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-bold text-white mt-6 mb-3 tracking-wide">$1</h4>');

  // 水平線
  html = html.replace(/^---$/gm, '<hr class="border-white/5 my-8" />');

  // 太字
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">$1</strong>');

  // 箇条書きリスト (グループ化)
  // 改行区切りでリストアイテムを検出して <li> 化
  html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 leading-loose">$1</li>');
  
  // 改行コードの <br /> 化 (リストタグの後などは改行しないよう調整しつつ)
  html = html.replace(/\n/g, "<br />");

  return html;
}

// Pictographs, skin tones, variation selectors and joiners: the pieces that phones draw as emoji.
const EMOJI = /[\u{1F000}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2B00}-\u{2BFF}]|\u{FE0F}|\u{200D}/gu;

export function withoutEmoji(text: string) {
  return text.replace(EMOJI, ' ').replace(/\s+([,.!?”])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

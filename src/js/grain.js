// 画面全体に乗せるフィルムの粒子。模様を canvas で作り、CSS の --noise に入れる。
export const applyGrain = function () {
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
    image.data[i + 3] = 34;
  }
  ctx.putImageData(image, 0, 0);
  document.documentElement.style.setProperty(
    '--noise',
    `url(${canvas.toDataURL()})`
  );
};

import {
  createViewer,
  PerspectiveCamera,
  Vector3,
  Color,
  BackgroundMode,
  SplatLoader,
  SplatUtils,
  setViewerConfig,
} from '@manycore/aholo-viewer';

// 文件扩展名 → SplatFileType
const EXT_TO_TYPE = {
  ply: 0, splat: 2, ksplat: 3, sog: 4, lcc: 5, esz: 6, spz: 1,
};

function getPackType(ext) {
  if (ext === 'sog') return 3;
  if (ext === 'spz' || ext === 'esz') return 1;
  return 0;
}

const params = new URLSearchParams(window.location.search);
const fileUrl = params.get('file') || params.get('url');
const container = document.getElementById('viewer');
const loadingEl = document.getElementById('loading');

if (!fileUrl) {
  loadingEl.textContent = '用法: ?file=你的文件URL';
} else {
  startViewer(fileUrl);
}

async function startViewer(url) {
  try {
    const ext = (url.split('.').pop().split('?')[0] || 'ply').toLowerCase();
    const fileType = EXT_TO_TYPE[ext] ?? 0;
    const packType = getPackType(ext);

    loadingEl.textContent = '下载中...';
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const buffer = await resp.arrayBuffer();

    loadingEl.textContent = '解析中...';
    const data = await SplatLoader.parseSplatData(fileType, new Uint8Array(buffer), packType);
    const splat = await SplatUtils.createSplat(data);

    loadingEl.textContent = '渲染中...';
    const viewer = createViewer('main-viewer', container, {});

    // Aholo 坐标系: +Z 为上方向
    const camera = new PerspectiveCamera(60, 1, 0.1, 2000);
    camera.up.set(0, 0, 1);

    const bounds = splat.geometry?.boundingBox;
    if (bounds) {
      const c = bounds.getCenter(new Vector3());
      const s = bounds.getSize(new Vector3());
      const d = Math.max(s.x, s.y, s.z) * 1.5;
      camera.position.set(c.x, c.y + d * 0.3, c.z + d);
      camera.lookAt(c);
    } else {
      camera.position.set(0, 1, 8);
      camera.lookAt(new Vector3(0, 0, 0));
    }

    viewer.getScene().add(splat);
    viewer.setCamera(camera);

    setViewerConfig(viewer, {
      pipeline: {
        Background: {
          background: {
            active: BackgroundMode.BasicBackground,
            basic: { color: new Color(0.08, 0.08, 0.12) },
          },
          ground: { enabled: false },
        },
        Splatting: {
          enabled: true,
          precalculateEnabled: true,
        },
        TAA: { enabled: false },
      },
    });

    function render() { viewer.render(); }
    viewer.requestRenderHandler = () => requestAnimationFrame(render);
    requestAnimationFrame(render);

    loadingEl.style.display = 'none';
  } catch (err) {
    loadingEl.textContent = '加载失败: ' + err.message;
    console.error(err);
  }
}

// src/manifest.ts
import { ManifestV3Export } from '@crxjs/vite-plugin';

const manifest: ManifestV3Export = {
    name: 'Ruler',
    description: 'Quickly measure elements on any webpage with this on-screen ruler tool—perfect for web designers, developers, and anyone who needs precise pixel measurements at a glance.',
    version: '1.0.0',
    manifest_version: 3,
    icons: {
        16: "src/_shared/icons/ruler.svg",
        48: "src/_shared/icons/ruler.svg",
        128: "src/_shared/icons/ruler.svg",
    },
    background: {
        service_worker: 'src/background/main.ts',
    },
    content_scripts: [
        {
            matches: ["<all_urls>"],
            js: ['src/content/main.ts'],
        },
    ],
    action: {
        default_popup: 'src/popup/index.html',
        default_icon: "src/_shared/icons/ruler.svg",
        default_title: "Ruler Extension"
    },
    permissions: [],
};

export default manifest;

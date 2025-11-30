if (!self.define) {
  let a,
    e = {};
  const c = (c, s) => (
    (c = new URL(c + '.js', s).href),
    e[c] ||
      new Promise((e) => {
        if ('document' in self) {
          const a = document.createElement('script');
          ((a.src = c), (a.onload = e), document.head.appendChild(a));
        } else ((a = c), importScripts(c), e());
      }).then(() => {
        let a = e[c];
        if (!a) throw new Error(`Module ${c} didn’t register its module`);
        return a;
      })
  );
  self.define = (s, i) => {
    const n =
      a ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (e[n]) return;
    let d = {};
    const t = (a) => c(a, n),
      b = { module: { uri: n }, exports: d, require: t };
    e[n] = Promise.all(s.map((a) => b[a] || t(a))).then((a) => (i(...a), d));
  };
}
define(['./workbox-cb477421'], function (a) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    a.clientsClaim(),
    a.precacheAndRoute(
      [
        {
          url: '/Novunt_BGI2.jpg',
          revision: '3a5bcec7a598b1773eb66861532b41ab',
        },
        {
          url: '/Novunt_BGI3.jpg',
          revision: 'e9130e77190b9ebe1685941b5222a776',
        },
        {
          url: '/Novunt_BGI4.jpg',
          revision: 'ff16e1f66345162bb75fabcbf3cd38e4',
        },
        {
          url: '/Novunt_BGI5.jpg',
          revision: 'ef29cae3f61236d8b09130b720bf4660',
        },
        {
          url: '/Novunt_BGI6.jpg',
          revision: 'fcf9e814c008149cb8eca6e9df3439d4',
        },
        {
          url: '/Novunt_BGI7.jpg',
          revision: 'f0732eb53b29c743838aed7cf76ed246',
        },
        {
          url: '/Novunt_BGI8.jpg',
          revision: '5d401476f1bfbe49a516288951c68cf7',
        },
        {
          url: '/_next/static/chunks/1198-92e3283de3e0a2f6.js',
          revision: '92e3283de3e0a2f6',
        },
        {
          url: '/_next/static/chunks/1198-92e3283de3e0a2f6.js.map',
          revision: '1bf700c734c722155416564bdafbe470',
        },
        {
          url: '/_next/static/chunks/1423-fc0ebeb2c89a3a05.js',
          revision: 'fc0ebeb2c89a3a05',
        },
        {
          url: '/_next/static/chunks/1423-fc0ebeb2c89a3a05.js.map',
          revision: '50bf253f074748596a0b6aba4c3319db',
        },
        {
          url: '/_next/static/chunks/1528-2da820daed383d7f.js',
          revision: '2da820daed383d7f',
        },
        {
          url: '/_next/static/chunks/1528-2da820daed383d7f.js.map',
          revision: '782ccf0e6da1a9463d363807e78525e4',
        },
        {
          url: '/_next/static/chunks/1646.45d014c16fd881b5.js',
          revision: '45d014c16fd881b5',
        },
        {
          url: '/_next/static/chunks/1646.45d014c16fd881b5.js.map',
          revision: '3c03f9503c0946355becc56155837d60',
        },
        {
          url: '/_next/static/chunks/1761-32ba3484a3e5cc55.js',
          revision: '32ba3484a3e5cc55',
        },
        {
          url: '/_next/static/chunks/1761-32ba3484a3e5cc55.js.map',
          revision: 'e3770058c7612bfab4717ba8afb94815',
        },
        {
          url: '/_next/static/chunks/1903-0fb2f924f3d5699e.js',
          revision: '0fb2f924f3d5699e',
        },
        {
          url: '/_next/static/chunks/1903-0fb2f924f3d5699e.js.map',
          revision: '0af614c25c4ca570ee800f3f7b00646f',
        },
        {
          url: '/_next/static/chunks/220-9821df4ca89b9978.js',
          revision: '9821df4ca89b9978',
        },
        {
          url: '/_next/static/chunks/220-9821df4ca89b9978.js.map',
          revision: 'b169dad3d3bd8160feeedc4540483eca',
        },
        {
          url: '/_next/static/chunks/2255-585c27b85cf979db.js',
          revision: '585c27b85cf979db',
        },
        {
          url: '/_next/static/chunks/2255-585c27b85cf979db.js.map',
          revision: '2d930986b0132c728c1790cc22d22a7d',
        },
        {
          url: '/_next/static/chunks/2619-31293ee93b22fec4.js',
          revision: '31293ee93b22fec4',
        },
        {
          url: '/_next/static/chunks/2619-31293ee93b22fec4.js.map',
          revision: 'dbc2e848eb315dcad8e980736231b094',
        },
        {
          url: '/_next/static/chunks/2894-9f25c22e73e8bcc8.js',
          revision: '9f25c22e73e8bcc8',
        },
        {
          url: '/_next/static/chunks/2894-9f25c22e73e8bcc8.js.map',
          revision: '51cdef43dba65d8728628a4564bc3237',
        },
        {
          url: '/_next/static/chunks/2985.65f32a0c2cd49e07.js',
          revision: '65f32a0c2cd49e07',
        },
        {
          url: '/_next/static/chunks/2985.65f32a0c2cd49e07.js.map',
          revision: 'd3d2a11a79faea720ab6e2cf3b68d852',
        },
        {
          url: '/_next/static/chunks/30a37ab2-7ca6ffc2e31c29fe.js',
          revision: '7ca6ffc2e31c29fe',
        },
        {
          url: '/_next/static/chunks/3143-bb20a269e6ad1a3d.js',
          revision: 'bb20a269e6ad1a3d',
        },
        {
          url: '/_next/static/chunks/3143-bb20a269e6ad1a3d.js.map',
          revision: 'd9a0de2ef22565508a9424b81a97a792',
        },
        {
          url: '/_next/static/chunks/3344-1535b2ba33b889c4.js',
          revision: '1535b2ba33b889c4',
        },
        {
          url: '/_next/static/chunks/3344-1535b2ba33b889c4.js.map',
          revision: '56af8efbfd584dd4d9f63a47f3093146',
        },
        {
          url: '/_next/static/chunks/3361.2043a5aa049da740.js',
          revision: '2043a5aa049da740',
        },
        {
          url: '/_next/static/chunks/3361.2043a5aa049da740.js.map',
          revision: 'f33bc392c250c01f3fbf2fc5304f06d3',
        },
        {
          url: '/_next/static/chunks/4038-bbe19f546b0b2a87.js',
          revision: 'bbe19f546b0b2a87',
        },
        {
          url: '/_next/static/chunks/4038-bbe19f546b0b2a87.js.map',
          revision: '11ad1f7d4c02946d228694e2723bc1e4',
        },
        {
          url: '/_next/static/chunks/4193-91af5cfd49fe5f9c.js',
          revision: '91af5cfd49fe5f9c',
        },
        {
          url: '/_next/static/chunks/4193-91af5cfd49fe5f9c.js.map',
          revision: '9c63024a21ff3bdc19f4db744c53969c',
        },
        {
          url: '/_next/static/chunks/4337-cbfc65da175548a4.js',
          revision: 'cbfc65da175548a4',
        },
        {
          url: '/_next/static/chunks/4337-cbfc65da175548a4.js.map',
          revision: 'a7325e1ce415f67d019ecc8aa3095eb8',
        },
        {
          url: '/_next/static/chunks/4383.773c35492a4197f5.js',
          revision: '773c35492a4197f5',
        },
        {
          url: '/_next/static/chunks/4383.773c35492a4197f5.js.map',
          revision: 'a0088b681b3a8ab311212a6074daed5e',
        },
        {
          url: '/_next/static/chunks/4757-ded36483851ea102.js',
          revision: 'ded36483851ea102',
        },
        {
          url: '/_next/static/chunks/4757-ded36483851ea102.js.map',
          revision: '78c1d62632d3df96ee6899f94985f6b8',
        },
        {
          url: '/_next/static/chunks/4909-9d6d85837511f493.js',
          revision: '9d6d85837511f493',
        },
        {
          url: '/_next/static/chunks/4909-9d6d85837511f493.js.map',
          revision: '7d6382a0dde0e30e4febd311a2eba73a',
        },
        {
          url: '/_next/static/chunks/4bd1b696-64498adba8efdb2e.js',
          revision: '64498adba8efdb2e',
        },
        {
          url: '/_next/static/chunks/4bd1b696-64498adba8efdb2e.js.map',
          revision: 'e51f220adfbf0d118b57ab53ac90220d',
        },
        {
          url: '/_next/static/chunks/5125-0bd362f21c26ae6e.js',
          revision: '0bd362f21c26ae6e',
        },
        {
          url: '/_next/static/chunks/5125-0bd362f21c26ae6e.js.map',
          revision: '127aa7f3961855f4c1136042e585f4e6',
        },
        {
          url: '/_next/static/chunks/5139.b45c251335b3babe.js',
          revision: 'b45c251335b3babe',
        },
        {
          url: '/_next/static/chunks/5139.b45c251335b3babe.js.map',
          revision: '375ed209ae2b3bb49a81013a77014f48',
        },
        {
          url: '/_next/static/chunks/5239-7545fa157a030f3f.js',
          revision: '7545fa157a030f3f',
        },
        {
          url: '/_next/static/chunks/5239-7545fa157a030f3f.js.map',
          revision: '57bcbc01d119f7ccc13d2937dc85aeed',
        },
        {
          url: '/_next/static/chunks/52774a7f-10d3682eacf6ebaa.js',
          revision: '10d3682eacf6ebaa',
        },
        {
          url: '/_next/static/chunks/52774a7f-10d3682eacf6ebaa.js.map',
          revision: '72776d26fcc66a77d26d6cb31024444c',
        },
        {
          url: '/_next/static/chunks/5314-0ef2e4e5437cde80.js',
          revision: '0ef2e4e5437cde80',
        },
        {
          url: '/_next/static/chunks/5314-0ef2e4e5437cde80.js.map',
          revision: '316d6069599849424ad157c32ba34055',
        },
        {
          url: '/_next/static/chunks/5998-3a70f13d5e57c6ab.js',
          revision: '3a70f13d5e57c6ab',
        },
        {
          url: '/_next/static/chunks/5998-3a70f13d5e57c6ab.js.map',
          revision: 'c135921a53ebfc5274d73f88cc4a5c62',
        },
        {
          url: '/_next/static/chunks/6019-f55bb31b729a7a87.js',
          revision: 'f55bb31b729a7a87',
        },
        {
          url: '/_next/static/chunks/6019-f55bb31b729a7a87.js.map',
          revision: 'a0c485cc9693ce0b29c077b84fe7c35b',
        },
        {
          url: '/_next/static/chunks/6119-2b6400461d7df207.js',
          revision: '2b6400461d7df207',
        },
        {
          url: '/_next/static/chunks/6119-2b6400461d7df207.js.map',
          revision: '3eb84ae7c930cdc6dc42f869c8df3a1f',
        },
        {
          url: '/_next/static/chunks/630-deb6150a70e74541.js',
          revision: 'deb6150a70e74541',
        },
        {
          url: '/_next/static/chunks/630-deb6150a70e74541.js.map',
          revision: 'ca8f47fb95b0bd950f9fbb3946ea41a9',
        },
        {
          url: '/_next/static/chunks/772-cde88aa069441f75.js',
          revision: 'cde88aa069441f75',
        },
        {
          url: '/_next/static/chunks/772-cde88aa069441f75.js.map',
          revision: '4b8bfa8f8d5664996dddfff3d378ede0',
        },
        {
          url: '/_next/static/chunks/7729-66136466f9536d83.js',
          revision: '66136466f9536d83',
        },
        {
          url: '/_next/static/chunks/7729-66136466f9536d83.js.map',
          revision: 'cf039bbe968f4194e9ab8ce764e513be',
        },
        {
          url: '/_next/static/chunks/7750.32180d3dddf27d5b.js',
          revision: '32180d3dddf27d5b',
        },
        {
          url: '/_next/static/chunks/7750.32180d3dddf27d5b.js.map',
          revision: '006522388bf3f5c30e2f29550ed0b7ec',
        },
        {
          url: '/_next/static/chunks/7766-5f550372bcc8d85a.js',
          revision: '5f550372bcc8d85a',
        },
        {
          url: '/_next/static/chunks/7766-5f550372bcc8d85a.js.map',
          revision: '723a856287c5cf2c4607423b4eb8897b',
        },
        {
          url: '/_next/static/chunks/7802-6093e556ce84ca16.js',
          revision: '6093e556ce84ca16',
        },
        {
          url: '/_next/static/chunks/7802-6093e556ce84ca16.js.map',
          revision: '9371717b229a4c0ed97873d3d368971b',
        },
        {
          url: '/_next/static/chunks/7943-60a84ed94adfe3eb.js',
          revision: '60a84ed94adfe3eb',
        },
        {
          url: '/_next/static/chunks/7943-60a84ed94adfe3eb.js.map',
          revision: '984e9ed00ed283a9cd3c52db4a6d775b',
        },
        {
          url: '/_next/static/chunks/8171-08e85265f1a17641.js',
          revision: '08e85265f1a17641',
        },
        {
          url: '/_next/static/chunks/8171-08e85265f1a17641.js.map',
          revision: '7c6af881a19c57a4d04f08ed8742c0b5',
        },
        {
          url: '/_next/static/chunks/8342-b997bd797624416d.js',
          revision: 'b997bd797624416d',
        },
        {
          url: '/_next/static/chunks/8342-b997bd797624416d.js.map',
          revision: '3be8139c60a6f471b1b6f5fc6225d7e6',
        },
        {
          url: '/_next/static/chunks/8519-43791ed00cce68cd.js',
          revision: '43791ed00cce68cd',
        },
        {
          url: '/_next/static/chunks/8519-43791ed00cce68cd.js.map',
          revision: 'e7ae92fd8942b74d72cfc0f97d157474',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-9ad0890e63b62aaa.js',
          revision: '9ad0890e63b62aaa',
        },
        {
          url: '/_next/static/chunks/8e1d74a4-9ad0890e63b62aaa.js.map',
          revision: '9386f9817d35995215ebcfc953aec804',
        },
        {
          url: '/_next/static/chunks/905-e8d6d9706cd5fca0.js',
          revision: 'e8d6d9706cd5fca0',
        },
        {
          url: '/_next/static/chunks/905-e8d6d9706cd5fca0.js.map',
          revision: 'e8d5d4ce079832119549c459468e47c1',
        },
        {
          url: '/_next/static/chunks/9061-a3094e77f964f328.js',
          revision: 'a3094e77f964f328',
        },
        {
          url: '/_next/static/chunks/9061-a3094e77f964f328.js.map',
          revision: 'fddde43b32006bb4fc5b785f5006614e',
        },
        {
          url: '/_next/static/chunks/9315.a865d275e73748a0.js',
          revision: 'a865d275e73748a0',
        },
        {
          url: '/_next/static/chunks/9315.a865d275e73748a0.js.map',
          revision: '33b7e90c06397b285f8011f0cc317c75',
        },
        {
          url: '/_next/static/chunks/9486-542cc0747a68a908.js',
          revision: '542cc0747a68a908',
        },
        {
          url: '/_next/static/chunks/9486-542cc0747a68a908.js.map',
          revision: '3a522d0ee4a2e53532972e508a0d5dee',
        },
        {
          url: '/_next/static/chunks/9507-232b7b804fbb26c8.js',
          revision: '232b7b804fbb26c8',
        },
        {
          url: '/_next/static/chunks/9507-232b7b804fbb26c8.js.map',
          revision: 'fd63bfab7dccd3cd53fccb44dcd533c5',
        },
        {
          url: '/_next/static/chunks/960-b3217efafbcbc131.js',
          revision: 'b3217efafbcbc131',
        },
        {
          url: '/_next/static/chunks/960-b3217efafbcbc131.js.map',
          revision: '68856af3fe81b57c99b88f811fd9743a',
        },
        {
          url: '/_next/static/chunks/9764-936bc48cc0805e9d.js',
          revision: '936bc48cc0805e9d',
        },
        {
          url: '/_next/static/chunks/9764-936bc48cc0805e9d.js.map',
          revision: '3d67c245517106fc51c931aa58a988fd',
        },
        {
          url: '/_next/static/chunks/9997-cb9cc2fa84e785f4.js',
          revision: 'cb9cc2fa84e785f4',
        },
        {
          url: '/_next/static/chunks/9997-cb9cc2fa84e785f4.js.map',
          revision: '42f2e2f9c932a909f65b2febb8bd6373',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-5c4b43312a600ffd.js',
          revision: '5c4b43312a600ffd',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-5c4b43312a600ffd.js.map',
          revision: 'af44354807fec2358e59bd8963943319',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-5ac5029d5ef9f2ad.js',
          revision: '5ac5029d5ef9f2ad',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-5ac5029d5ef9f2ad.js.map',
          revision: '5081858698d22d55df43aa85cd07e197',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-298f67229c045e96.js',
          revision: '298f67229c045e96',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-298f67229c045e96.js.map',
          revision: 'fe77672408a094fcf17e4cf87e0e2e8e',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-c64ed6d70572451b.js',
          revision: 'c64ed6d70572451b',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-c64ed6d70572451b.js.map',
          revision: '2cae88719c69cbcc4599ef4256f75262',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/page-8c56b4c4db929813.js',
          revision: '8c56b4c4db929813',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/ros/page-1c046acbb456d77b.js',
          revision: '1c046acbb456d77b',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/ros/page-1c046acbb456d77b.js.map',
          revision: '2157b9ad7a31d4abf353b23351d88a1b',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-931156378e9e2107.js',
          revision: '931156378e9e2107',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-931156378e9e2107.js.map',
          revision: 'e57fe62b2cbda66ea1e3f659d9fcdbf6',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-ba54685482bc632f.js',
          revision: 'ba54685482bc632f',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-ba54685482bc632f.js.map',
          revision: 'f9950286f19b31606d9115df5d596e26',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-eeb5c77523414b83.js',
          revision: 'eeb5c77523414b83',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-eeb5c77523414b83.js.map',
          revision: 'af920e32f7f8968ddbec485b8140bd11',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-6f7cbe2a1633bc21.js',
          revision: '6f7cbe2a1633bc21',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-6f7cbe2a1633bc21.js.map',
          revision: 'eb6c3443dd8ecc80a49aea1d48f6ac63',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-625c627cd0fa1816.js',
          revision: '625c627cd0fa1816',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-625c627cd0fa1816.js.map',
          revision: '870a91807dc58044ccca7042eb516eae',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-ab001e1ea0904111.js',
          revision: 'ab001e1ea0904111',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-ab001e1ea0904111.js.map',
          revision: 'be1ba0b5c9a4666b94b6bc037ddd40c2',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-789554f903de353b.js',
          revision: '789554f903de353b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-8fa053b3aa870da1.js',
          revision: '8fa053b3aa870da1',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-8fa053b3aa870da1.js.map',
          revision: 'e571588e27e41b3e92ca5ec3cfa207ac',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-e4cecb707eeb25a0.js',
          revision: 'e4cecb707eeb25a0',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-e4cecb707eeb25a0.js.map',
          revision: '7fd1560ad11fd7e039d748d8a80e91e6',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-b7ea3d8cdcd014ca.js',
          revision: 'b7ea3d8cdcd014ca',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-b7ea3d8cdcd014ca.js.map',
          revision: '1e32552b55ec382bc969245b91de16c2',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-0d42a5fa1e391fc7.js',
          revision: '0d42a5fa1e391fc7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-0d42a5fa1e391fc7.js.map',
          revision: 'a4924fbdf1ac1032d0fb019364cd1a80',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-674c52469668e75d.js',
          revision: '674c52469668e75d',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-674c52469668e75d.js.map',
          revision: '6bf788981147869bb5d3873f19fe8592',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-e8ba1905d16dd733.js',
          revision: 'e8ba1905d16dd733',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-e8ba1905d16dd733.js.map',
          revision: '0babaf115888f2496a4e749189db46e9',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-67cf307d6d454029.js',
          revision: '67cf307d6d454029',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-67cf307d6d454029.js.map',
          revision: 'd81508d8f3a5abe74c7dcdfeeb5d6e26',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-922774cde8fd9df1.js',
          revision: '922774cde8fd9df1',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-922774cde8fd9df1.js.map',
          revision: 'c77e4a9db57edcb7d208e347993955d9',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-43d0ce62f91e321d.js',
          revision: '43d0ce62f91e321d',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-43d0ce62f91e321d.js.map',
          revision: '180e7213387cae7df676a704a9b2bc90',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-9fcc125cb71c4cc6.js',
          revision: '9fcc125cb71c4cc6',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-9fcc125cb71c4cc6.js.map',
          revision: '56a8a84265c39967334e2c180fc94cde',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-b671b28c9c6c64d3.js',
          revision: 'b671b28c9c6c64d3',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-b671b28c9c6c64d3.js.map',
          revision: '4124ca21d535eb3d4711aa7155301bb9',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-de0bd5d1a2878d11.js',
          revision: 'de0bd5d1a2878d11',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-de0bd5d1a2878d11.js.map',
          revision: '8bea0841e98a07050ffa4b65317a0e3a',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-9f86cf7e0a4540d7.js',
          revision: '9f86cf7e0a4540d7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-9f86cf7e0a4540d7.js.map',
          revision: '994b37bd57e2eb2ee2556909b4f4b7ed',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-006c143b9b125783.js',
          revision: '006c143b9b125783',
        },
        {
          url: '/_next/static/chunks/app/api/proxy/(proxy)/%5B...path%5D/route-a3ab7bb7f3964509.js',
          revision: 'a3ab7bb7f3964509',
        },
        {
          url: '/_next/static/chunks/app/api/sentry-example-api/route-0fe69c38574ea5f4.js',
          revision: '0fe69c38574ea5f4',
        },
        {
          url: '/_next/static/chunks/app/api/test-proxy/route-895f12f011146f93.js',
          revision: '895f12f011146f93',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-a869dee72e9f2fb8.js',
          revision: 'a869dee72e9f2fb8',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-a869dee72e9f2fb8.js.map',
          revision: '7a253496537bd6c331117f53ca2dce06',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-9006a9d2435964f6.js',
          revision: '9006a9d2435964f6',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-9006a9d2435964f6.js.map',
          revision: '25c7ae70c030cbdbf6273050255d59a2',
        },
        {
          url: '/_next/static/chunks/app/error-cd0bd1e0e724c9ec.js',
          revision: 'cd0bd1e0e724c9ec',
        },
        {
          url: '/_next/static/chunks/app/error-cd0bd1e0e724c9ec.js.map',
          revision: 'b4ac74dbd8c4d01c8f7fde3bc021acff',
        },
        {
          url: '/_next/static/chunks/app/global-error-e5415ebdac43499f.js',
          revision: 'e5415ebdac43499f',
        },
        {
          url: '/_next/static/chunks/app/global-error-e5415ebdac43499f.js.map',
          revision: 'ae9893847d709bf3e17016ad34dfa980',
        },
        {
          url: '/_next/static/chunks/app/layout-7482d4b8de10c0a5.js',
          revision: '7482d4b8de10c0a5',
        },
        {
          url: '/_next/static/chunks/app/layout-7482d4b8de10c0a5.js.map',
          revision: '53205f95522fd16ef78bac4301c0812d',
        },
        {
          url: '/_next/static/chunks/app/not-found-a71c98bb714cb924.js',
          revision: 'a71c98bb714cb924',
        },
        {
          url: '/_next/static/chunks/app/not-found-a71c98bb714cb924.js.map',
          revision: '9fbf79335dd63879bab2338d8956165a',
        },
        {
          url: '/_next/static/chunks/app/page-591c0144c2b90205.js',
          revision: '591c0144c2b90205',
        },
        {
          url: '/_next/static/chunks/app/page-591c0144c2b90205.js.map',
          revision: '95ec9ebdb71dd095d7b0d68d9c9c22f7',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-8df4d211d39d6480.js',
          revision: '8df4d211d39d6480',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-8df4d211d39d6480.js.map',
          revision: 'fbd815085534e264088fb4f12f41e3f7',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-ab24c84676b7969a.js',
          revision: 'ab24c84676b7969a',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-ab24c84676b7969a.js.map',
          revision: 'fbb10851dfa4ed5efa16c1559616d592',
        },
        {
          url: '/_next/static/chunks/framework-95abbcfd013613b2.js',
          revision: '95abbcfd013613b2',
        },
        {
          url: '/_next/static/chunks/framework-95abbcfd013613b2.js.map',
          revision: 'e7ebd68c2422d7615c4b864b1df5f34a',
        },
        {
          url: '/_next/static/chunks/main-app-08806a099c847a68.js',
          revision: '08806a099c847a68',
        },
        {
          url: '/_next/static/chunks/main-app-08806a099c847a68.js.map',
          revision: 'f435dfde162264239f81b715c52588fb',
        },
        {
          url: '/_next/static/chunks/main-d40e1fca4141f322.js',
          revision: 'd40e1fca4141f322',
        },
        {
          url: '/_next/static/chunks/main-d40e1fca4141f322.js.map',
          revision: '912bd47355de4c85ecb373336525ceaf',
        },
        {
          url: '/_next/static/chunks/pages/_app-b5709606502fc039.js',
          revision: 'b5709606502fc039',
        },
        {
          url: '/_next/static/chunks/pages/_app-b5709606502fc039.js.map',
          revision: 'cac3d501d06313ee4a9e5fde00780ce8',
        },
        {
          url: '/_next/static/chunks/pages/_error-cbbba11484e4dc18.js',
          revision: 'cbbba11484e4dc18',
        },
        {
          url: '/_next/static/chunks/pages/_error-cbbba11484e4dc18.js.map',
          revision: 'a159149cc7b54f1d5918573cb5e4ebcf',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-a7fab449fff2f34c.js',
          revision: 'a7fab449fff2f34c',
        },
        {
          url: '/_next/static/chunks/webpack-a7fab449fff2f34c.js.map',
          revision: '1c555ff15d2dbb1f3d5273689a0b1b12',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css.map',
          revision: '93a09b79a74036f25b749b0213a3a53c',
        },
        {
          url: '/_next/static/css/8cbd000aece22e74.css',
          revision: '8cbd000aece22e74',
        },
        {
          url: '/_next/static/css/8cbd000aece22e74.css.map',
          revision: '44cdee9a02b75bcf97682d200e298d25',
        },
        {
          url: '/_next/static/css/9140a8a31a1d3f61.css',
          revision: '9140a8a31a1d3f61',
        },
        {
          url: '/_next/static/css/9140a8a31a1d3f61.css.map',
          revision: '86fef1bc73028b88bf4c757cf75b4532',
        },
        {
          url: '/_next/static/css/96ceef82eedee5d2.css',
          revision: '96ceef82eedee5d2',
        },
        {
          url: '/_next/static/css/96ceef82eedee5d2.css.map',
          revision: '78f65a72a230168169feb81d41ed3b43',
        },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        {
          url: '/_next/static/oYae0quDgFS6Gc6kdsmjQ/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/favicon.ico', revision: 'd674d0b708bdf71d2fedd2986407ef40' },
        { url: '/file.svg', revision: 'd09f95206c3fa0bb9bd9fefabfd0ea71' },
        { url: '/globe.svg', revision: '2aaafa6a49b6563925fe440891e32717' },
        { url: '/icon-192.png', revision: 'd674d0b708bdf71d2fedd2986407ef40' },
        { url: '/icon-512.png', revision: 'd674d0b708bdf71d2fedd2986407ef40' },
        {
          url: '/icons/icon-maskable.svg',
          revision: 'b30b9afd20c153444d42f544ca8642dd',
        },
        {
          url: '/icons/icon-monochrome.svg',
          revision: 'bd5fecaf75ae3c3f6a5ae2fda6b17a96',
        },
        {
          url: '/icons/icon.svg',
          revision: '1ff218f02ca0fd51a10c364ee2969d75',
        },
        {
          url: '/icons/novunt.png',
          revision: '0c99c2df78b6133fc1f04f5246d49fcd',
        },
        {
          url: '/icons/novunt_short.png',
          revision: 'd674d0b708bdf71d2fedd2986407ef40',
        },
        { url: '/manifest.json', revision: 'a9d989252a7dec77955b440f93b300ec' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/offline.html', revision: '6516ea44af587db50a1f6dd78cc9333d' },
        { url: '/vault-bg.jpg', revision: 'a077d02187985aa59a732428a34d65fc' },
        { url: '/vercel.svg', revision: 'c0af2f507b369b085b35ef4bbe3bcf1e' },
        { url: '/window.svg', revision: 'a2760511c65806022ad20adf74370ff3' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    a.cleanupOutdatedCaches(),
    a.registerRoute(
      '/',
      new a.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: a,
              response: e,
              event: c,
              state: s,
            }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /^https?.*/,
      new a.NetworkFirst({
        cacheName: 'offlineCache',
        plugins: [new a.ExpirationPlugin({ maxEntries: 200 })],
      }),
      'GET'
    ));
});
//# sourceMappingURL=sw.js.map

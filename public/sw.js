if (!self.define) {
  let e,
    a = {};
  const s = (s, c) => (
    (s = new URL(s + '.js', c).href),
    a[s] ||
      new Promise((a) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = s), (e.onload = a), document.head.appendChild(e));
        } else ((e = s), importScripts(s), a());
      }).then(() => {
        let e = a[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (c, i) => {
    const d =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (a[d]) return;
    let n = {};
    const t = (e) => s(e, d),
      b = { module: { uri: d }, exports: n, require: t };
    a[d] = Promise.all(c.map((e) => b[e] || t(e))).then((e) => (i(...e), n));
  };
}
define(['./workbox-cb477421'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
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
          url: '/_next/static/azTKYFgarTn6NdGr31NaW/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1555-982ce42b338c5b32.js',
          revision: '982ce42b338c5b32',
        },
        {
          url: '/_next/static/chunks/1555-982ce42b338c5b32.js.map',
          revision: '438eb87340087d52f4fa0f2f86aef7f2',
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
          url: '/_next/static/chunks/1903-0fb2f924f3d5699e.js',
          revision: '0fb2f924f3d5699e',
        },
        {
          url: '/_next/static/chunks/1903-0fb2f924f3d5699e.js.map',
          revision: '0af614c25c4ca570ee800f3f7b00646f',
        },
        {
          url: '/_next/static/chunks/2454-9f75d0b3fa3a1987.js',
          revision: '9f75d0b3fa3a1987',
        },
        {
          url: '/_next/static/chunks/2454-9f75d0b3fa3a1987.js.map',
          revision: 'f859e1b7974056809b1a64772521bd59',
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
          url: '/_next/static/chunks/2894-00f210a374e37ac3.js',
          revision: '00f210a374e37ac3',
        },
        {
          url: '/_next/static/chunks/2894-00f210a374e37ac3.js.map',
          revision: 'c9b70a9e520d5d77e8014b3c63ae8bda',
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
          url: '/_next/static/chunks/3361.9c137edceb3019e7.js',
          revision: '9c137edceb3019e7',
        },
        {
          url: '/_next/static/chunks/3361.9c137edceb3019e7.js.map',
          revision: '48ed47d0a0d00f1fe576957e4a81d2a5',
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
          url: '/_next/static/chunks/4383.773c35492a4197f5.js',
          revision: '773c35492a4197f5',
        },
        {
          url: '/_next/static/chunks/4383.773c35492a4197f5.js.map',
          revision: 'a0088b681b3a8ab311212a6074daed5e',
        },
        {
          url: '/_next/static/chunks/4729-36822c987ef6d123.js',
          revision: '36822c987ef6d123',
        },
        {
          url: '/_next/static/chunks/4729-36822c987ef6d123.js.map',
          revision: 'f49d4fdb6b0704b9c1653e2c7f886d32',
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
          url: '/_next/static/chunks/5149-55b2119263d87cf5.js',
          revision: '55b2119263d87cf5',
        },
        {
          url: '/_next/static/chunks/5149-55b2119263d87cf5.js.map',
          revision: 'a2414cf3460a84383ce8531f75f38da5',
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
          revision: '9f3dca2bbbb132540a796aa3bd4e2f70',
        },
        {
          url: '/_next/static/chunks/5314-44448fa4c8c92803.js',
          revision: '44448fa4c8c92803',
        },
        {
          url: '/_next/static/chunks/5314-44448fa4c8c92803.js.map',
          revision: 'dcae85c17856dfb89e2ad0e3cb95b8c4',
        },
        {
          url: '/_next/static/chunks/5849-0160145adeb36263.js',
          revision: '0160145adeb36263',
        },
        {
          url: '/_next/static/chunks/5849-0160145adeb36263.js.map',
          revision: 'fa617c572e407e6eb35fa40a3b4c6198',
        },
        {
          url: '/_next/static/chunks/6521-4a3373f11df61521.js',
          revision: '4a3373f11df61521',
        },
        {
          url: '/_next/static/chunks/6521-4a3373f11df61521.js.map',
          revision: 'af33d6c498d4ba10ccf318a8eab542e0',
        },
        {
          url: '/_next/static/chunks/6617-a2d9611d5e1522a5.js',
          revision: 'a2d9611d5e1522a5',
        },
        {
          url: '/_next/static/chunks/6617-a2d9611d5e1522a5.js.map',
          revision: '233ff374874d490bf9a91eb55f07042f',
        },
        {
          url: '/_next/static/chunks/6664-74106e9ce5534ef3.js',
          revision: '74106e9ce5534ef3',
        },
        {
          url: '/_next/static/chunks/6664-74106e9ce5534ef3.js.map',
          revision: '673d6df5535e64b2cccc500fc55ac3f0',
        },
        {
          url: '/_next/static/chunks/7051-322300f54c3732ee.js',
          revision: '322300f54c3732ee',
        },
        {
          url: '/_next/static/chunks/7051-322300f54c3732ee.js.map',
          revision: 'e4be5c87078e3b0bb104291ee1d3937f',
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
          url: '/_next/static/chunks/7832-b2d1d6b235a3a9fb.js',
          revision: 'b2d1d6b235a3a9fb',
        },
        {
          url: '/_next/static/chunks/7832-b2d1d6b235a3a9fb.js.map',
          revision: 'b0960c8208248cc1399fc2fc867bdef2',
        },
        {
          url: '/_next/static/chunks/7928-592a944a1a730bab.js',
          revision: '592a944a1a730bab',
        },
        {
          url: '/_next/static/chunks/7928-592a944a1a730bab.js.map',
          revision: '4e5498a91876ea8abd326f87706a6849',
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
          url: '/_next/static/chunks/8419-dde8a661589fc51d.js',
          revision: 'dde8a661589fc51d',
        },
        {
          url: '/_next/static/chunks/8419-dde8a661589fc51d.js.map',
          revision: 'baffe540d2d7abb813070578db22731d',
        },
        {
          url: '/_next/static/chunks/869-86f4623762868af1.js',
          revision: '86f4623762868af1',
        },
        {
          url: '/_next/static/chunks/869-86f4623762868af1.js.map',
          revision: '270d087b7b898107d5a468938ddcc44f',
        },
        {
          url: '/_next/static/chunks/8858-c77f358cc936b615.js',
          revision: 'c77f358cc936b615',
        },
        {
          url: '/_next/static/chunks/8858-c77f358cc936b615.js.map',
          revision: 'd890e79b48ddac31debf29524a319344',
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
          url: '/_next/static/chunks/9127-ec4a9cd8533ad3e2.js',
          revision: 'ec4a9cd8533ad3e2',
        },
        {
          url: '/_next/static/chunks/9127-ec4a9cd8533ad3e2.js.map',
          revision: 'fdf382763b72359456ae472fc19decee',
        },
        {
          url: '/_next/static/chunks/9187-85ebfdbe13b64708.js',
          revision: '85ebfdbe13b64708',
        },
        {
          url: '/_next/static/chunks/9187-85ebfdbe13b64708.js.map',
          revision: '4430743d4dac4265b2d66c5135e7e387',
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
          url: '/_next/static/chunks/960-bb7f9b31c73db31b.js',
          revision: 'bb7f9b31c73db31b',
        },
        {
          url: '/_next/static/chunks/960-bb7f9b31c73db31b.js.map',
          revision: '645ee3042c792d8a41e166abfbe688bc',
        },
        {
          url: '/_next/static/chunks/9694-84c3159f979e42e2.js',
          revision: '84c3159f979e42e2',
        },
        {
          url: '/_next/static/chunks/9694-84c3159f979e42e2.js.map',
          revision: '2d8f4a98d411961d8b5ab8695cb82bc6',
        },
        {
          url: '/_next/static/chunks/9702-63cfbbbbd7ac62d2.js',
          revision: '63cfbbbbd7ac62d2',
        },
        {
          url: '/_next/static/chunks/9702-63cfbbbbd7ac62d2.js.map',
          revision: 'c3cc763e85b129d77857d9c93b9a84fb',
        },
        {
          url: '/_next/static/chunks/9764-1d505c035b9fa1ef.js',
          revision: '1d505c035b9fa1ef',
        },
        {
          url: '/_next/static/chunks/9764-1d505c035b9fa1ef.js.map',
          revision: 'f3c46601ff7f82e763555bf2124c3fe2',
        },
        {
          url: '/_next/static/chunks/9881-9d64227d65fdf78f.js',
          revision: '9d64227d65fdf78f',
        },
        {
          url: '/_next/static/chunks/9881-9d64227d65fdf78f.js.map',
          revision: 'bf62eb53888d11e97fa7767bb5448b15',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-6e7cd57909d79760.js',
          revision: '6e7cd57909d79760',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/analytics/page-6e7cd57909d79760.js.map',
          revision: '36ee613741116f4009994ef93a5e8a73',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-e6bfdf4a5ce055d4.js',
          revision: 'e6bfdf4a5ce055d4',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/kyc/page-e6bfdf4a5ce055d4.js.map',
          revision: '16ac7098c9475a3a1236eb03cb75665f',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-12e19472cba3d203.js',
          revision: '12e19472cba3d203',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-12e19472cba3d203.js.map',
          revision: 'ddaba6847bcb29a02c1cbc55df5d7fbb',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-5c1036c2c8888dd4.js',
          revision: '5c1036c2c8888dd4',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-5c1036c2c8888dd4.js.map',
          revision: 'a675f962e4316647333e53eef268c62b',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/page-8c56b4c4db929813.js',
          revision: '8c56b4c4db929813',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/ros/page-e29a69b1bb8f1d16.js',
          revision: 'e29a69b1bb8f1d16',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/ros/page-e29a69b1bb8f1d16.js.map',
          revision: '4696d0cffac88b21cdcfc5ac7191db82',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-05aaa18322b0ab0e.js',
          revision: '05aaa18322b0ab0e',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/settings/page-05aaa18322b0ab0e.js.map',
          revision: '66509f5e242e3680f4ddb504bfd836dc',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-97df1a622c635f62.js',
          revision: '97df1a622c635f62',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/transactions/page-97df1a622c635f62.js.map',
          revision: 'd31af0b15a8630ece11d22c363329b93',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-75e54363df922712.js',
          revision: '75e54363df922712',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/users/page-75e54363df922712.js.map',
          revision: '007abfa0cfeb6e96b9dcfdcd697891d6',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-5ddecb7c5dedc6eb.js',
          revision: '5ddecb7c5dedc6eb',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-5ddecb7c5dedc6eb.js.map',
          revision: '3a46a6d83d39c39c3e4d2a87d2d3024d',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-fdbee70cd620a5f2.js',
          revision: 'fdbee70cd620a5f2',
        },
        {
          url: '/_next/static/chunks/app/(auth)/layout-fdbee70cd620a5f2.js.map',
          revision: 'c7b74f9ce00a433d63b53f26b2988ad7',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-9bfe72291824c7a3.js',
          revision: '9bfe72291824c7a3',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-9bfe72291824c7a3.js.map',
          revision: 'f2660708993162b2af3f2852145245f7',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-789554f903de353b.js',
          revision: '789554f903de353b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-70f0a07d4104f066.js',
          revision: '70f0a07d4104f066',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-70f0a07d4104f066.js.map',
          revision: 'a4eb764cd6fc197e79a0b6c56dea02e2',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-2134e16ba8d4d317.js',
          revision: '2134e16ba8d4d317',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-2134e16ba8d4d317.js.map',
          revision: '0849bf54c7704087a174e45627d40104',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-e32888270e94415e.js',
          revision: 'e32888270e94415e',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-e32888270e94415e.js.map',
          revision: 'da0d8385f3ac644c068a9b2e2d650c4f',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-06a21668a9b2bd02.js',
          revision: '06a21668a9b2bd02',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/deposits/page-06a21668a9b2bd02.js.map',
          revision: '1b2d1c7884ef89f907a79ff3fe4dd3ba',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-35ba2f86bd86c9eb.js',
          revision: '35ba2f86bd86c9eb',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-35ba2f86bd86c9eb.js.map',
          revision: '7db14d4c31ba1c06b33618c0d21eab40',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-74b5e784540cb93c.js',
          revision: '74b5e784540cb93c',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-74b5e784540cb93c.js.map',
          revision: '5f0ec1a56ebe3480d4ce2012f1732bc9',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-4189c17274197644.js',
          revision: '4189c17274197644',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-4189c17274197644.js.map',
          revision: 'de224c2e967729da9afe6274abc7c515',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-da00608c64d7d049.js',
          revision: 'da00608c64d7d049',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-da00608c64d7d049.js.map',
          revision: '928027737ad1330e98e4473dbd06d6b7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-f905e1c9765ec03f.js',
          revision: 'f905e1c9765ec03f',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-f905e1c9765ec03f.js.map',
          revision: '32dddea51c6d57bd02547d3f40a448e2',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-c1f3df1068da7f42.js',
          revision: 'c1f3df1068da7f42',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-c1f3df1068da7f42.js.map',
          revision: '8e323e4f3818ddce1f522d9ced1e71c3',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-204c6af5541c9c68.js',
          revision: '204c6af5541c9c68',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-204c6af5541c9c68.js.map',
          revision: '216e63213f42111121b78e15d9605401',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-36e2e6b8f641b209.js',
          revision: '36e2e6b8f641b209',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-36e2e6b8f641b209.js.map',
          revision: 'd2c61f1fdcbacc6e04147dce2d734a94',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-15fc11560ff743d6.js',
          revision: '15fc11560ff743d6',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/withdrawals/page-15fc11560ff743d6.js.map',
          revision: 'e23fac22194c01bc853b1a0d12387d47',
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
          url: '/_next/static/chunks/app/debug-auth/page-0f453aa8a2380f37.js',
          revision: '0f453aa8a2380f37',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-0f453aa8a2380f37.js.map',
          revision: '3f46ba77db028571db2d656b29b0d24d',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-d34dde254686ee31.js',
          revision: 'd34dde254686ee31',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-d34dde254686ee31.js.map',
          revision: 'a3bdded16daedc1a0399647a33697f06',
        },
        {
          url: '/_next/static/chunks/app/error-250bd25de8f6e0b0.js',
          revision: '250bd25de8f6e0b0',
        },
        {
          url: '/_next/static/chunks/app/error-250bd25de8f6e0b0.js.map',
          revision: '7b6892c876c8581ce6d8dffd6f87cde0',
        },
        {
          url: '/_next/static/chunks/app/global-error-de1778393f56d419.js',
          revision: 'de1778393f56d419',
        },
        {
          url: '/_next/static/chunks/app/global-error-de1778393f56d419.js.map',
          revision: '6588a25a5f8834808443da57efb390fc',
        },
        {
          url: '/_next/static/chunks/app/layout-dff37cbbbf66e9c1.js',
          revision: 'dff37cbbbf66e9c1',
        },
        {
          url: '/_next/static/chunks/app/layout-dff37cbbbf66e9c1.js.map',
          revision: '442efd4c9aa33e83d15a7b38b3453340',
        },
        {
          url: '/_next/static/chunks/app/not-found-aceec019dedfeb6a.js',
          revision: 'aceec019dedfeb6a',
        },
        {
          url: '/_next/static/chunks/app/not-found-aceec019dedfeb6a.js.map',
          revision: '941e97c78f547b79478d5a91ae3c74c0',
        },
        {
          url: '/_next/static/chunks/app/page-62b682255ff61f38.js',
          revision: '62b682255ff61f38',
        },
        {
          url: '/_next/static/chunks/app/page-62b682255ff61f38.js.map',
          revision: '3258e11fb83f7c72de51fa4c313cfb78',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-e51ab4297072b7dc.js',
          revision: 'e51ab4297072b7dc',
        },
        {
          url: '/_next/static/chunks/app/sentry-example-page/page-e51ab4297072b7dc.js.map',
          revision: '7ac18e8f59e0e210b26932efc02b6225',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-65093bdd9b3e2fac.js',
          revision: '65093bdd9b3e2fac',
        },
        {
          url: '/_next/static/chunks/app/sentry-test/page-65093bdd9b3e2fac.js.map',
          revision: 'f799d8587f7970005f73b18865b2c226',
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
          url: '/_next/static/chunks/main-app-eca6279f6c36d13b.js',
          revision: 'eca6279f6c36d13b',
        },
        {
          url: '/_next/static/chunks/main-app-eca6279f6c36d13b.js.map',
          revision: 'b70a20108e63c3f4354a5b680f90524f',
        },
        {
          url: '/_next/static/chunks/main-c1c69fc804171d70.js',
          revision: 'c1c69fc804171d70',
        },
        {
          url: '/_next/static/chunks/main-c1c69fc804171d70.js.map',
          revision: 'cecf7b0410ab6eb4e0cf0930489efdcb',
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
          revision: '1616db9249540612e8944575777f5d77',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-9a3ff976364f4800.js',
          revision: '9a3ff976364f4800',
        },
        {
          url: '/_next/static/chunks/webpack-9a3ff976364f4800.js.map',
          revision: '7ebbb0c36bf0bb5e21d5eba0954f2433',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css.map',
          revision: 'aeaaa50962acbdf155b85ca818f170ec',
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
          url: '/_next/static/css/919dcdca806f1527.css',
          revision: '919dcdca806f1527',
        },
        {
          url: '/_next/static/css/919dcdca806f1527.css.map',
          revision: '3c02ecad4c131ce5ef3a48dd08a0d6d0',
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
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: a,
              event: s,
              state: c,
            }) =>
              a && 'opaqueredirect' === a.type
                ? new Response(a.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: a.headers,
                  })
                : a,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https?.*/,
      new e.NetworkFirst({
        cacheName: 'offlineCache',
        plugins: [new e.ExpirationPlugin({ maxEntries: 200 })],
      }),
      'GET'
    ));
});
//# sourceMappingURL=sw.js.map

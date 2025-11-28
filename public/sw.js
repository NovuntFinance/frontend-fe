if (!self.define) {
  let a,
    e = {};
  const s = (s, c) => (
    (s = new URL(s + '.js', c).href),
    e[s] ||
      new Promise((e) => {
        if ('document' in self) {
          const a = document.createElement('script');
          ((a.src = s), (a.onload = e), document.head.appendChild(a));
        } else ((a = s), importScripts(s), e());
      }).then(() => {
        let a = e[s];
        if (!a) throw new Error(`Module ${s} didn’t register its module`);
        return a;
      })
  );
  self.define = (c, i) => {
    const d =
      a ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href;
    if (e[d]) return;
    let n = {};
    const t = (a) => s(a, d),
      b = { module: { uri: d }, exports: n, require: t };
    e[d] = Promise.all(c.map((a) => b[a] || t(a))).then((a) => (i(...a), n));
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
          url: '/_next/static/Ak1hqRLGqCNzA_HJ49ZBo/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1555-b92118d208717329.js',
          revision: 'b92118d208717329',
        },
        {
          url: '/_next/static/chunks/1555-b92118d208717329.js.map',
          revision: '67a969929148e71706256a4beb2cc174',
        },
        {
          url: '/_next/static/chunks/1646.12b33b30693a1f57.js',
          revision: '12b33b30693a1f57',
        },
        {
          url: '/_next/static/chunks/1646.12b33b30693a1f57.js.map',
          revision: '8229d14519315f3dbf48d391a223ec2a',
        },
        {
          url: '/_next/static/chunks/1755-1d045b91111b4197.js',
          revision: '1d045b91111b4197',
        },
        {
          url: '/_next/static/chunks/1755-1d045b91111b4197.js.map',
          revision: 'f96573cb019f4114ad86030ae0c5a622',
        },
        {
          url: '/_next/static/chunks/2081-ac3d8a36ed91441f.js',
          revision: 'ac3d8a36ed91441f',
        },
        {
          url: '/_next/static/chunks/2081-ac3d8a36ed91441f.js.map',
          revision: '21bad083071236237bc54f5d216b6cea',
        },
        {
          url: '/_next/static/chunks/2255-444db33fa37229e1.js',
          revision: '444db33fa37229e1',
        },
        {
          url: '/_next/static/chunks/2255-444db33fa37229e1.js.map',
          revision: '58954e81f9c7a38663b68e404ec523db',
        },
        {
          url: '/_next/static/chunks/2413-2c83d09a60d1e9f8.js',
          revision: '2c83d09a60d1e9f8',
        },
        {
          url: '/_next/static/chunks/2413-2c83d09a60d1e9f8.js.map',
          revision: '19a9a9bb4a057cdcbcdcc2e4ff26a818',
        },
        {
          url: '/_next/static/chunks/2454-e7b8c11cc3a965ac.js',
          revision: 'e7b8c11cc3a965ac',
        },
        {
          url: '/_next/static/chunks/2454-e7b8c11cc3a965ac.js.map',
          revision: '3a15b2e0191b3eebe6ac7d9582bb4f39',
        },
        {
          url: '/_next/static/chunks/2619-741d1debdecabf86.js',
          revision: '741d1debdecabf86',
        },
        {
          url: '/_next/static/chunks/2619-741d1debdecabf86.js.map',
          revision: '8b58e369517c869291bab0630fe223dc',
        },
        {
          url: '/_next/static/chunks/2685-1aec5fde51f41f5c.js',
          revision: '1aec5fde51f41f5c',
        },
        {
          url: '/_next/static/chunks/2685-1aec5fde51f41f5c.js.map',
          revision: 'b766ea65013c4de5a3fe5c6b8bbb807f',
        },
        {
          url: '/_next/static/chunks/2894-5e1d271d52d9ed33.js',
          revision: '5e1d271d52d9ed33',
        },
        {
          url: '/_next/static/chunks/2894-5e1d271d52d9ed33.js.map',
          revision: '9096e4a9967957c828cbdeeef4028044',
        },
        {
          url: '/_next/static/chunks/2985.d3f0458ac1397530.js',
          revision: 'd3f0458ac1397530',
        },
        {
          url: '/_next/static/chunks/2985.d3f0458ac1397530.js.map',
          revision: '7fab232a6efb8b7c4e226ffb219b8911',
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
          url: '/_next/static/chunks/3735-5bbddd88f96f3e6a.js',
          revision: '5bbddd88f96f3e6a',
        },
        {
          url: '/_next/static/chunks/3735-5bbddd88f96f3e6a.js.map',
          revision: 'c7c2f41aecf09d09ec8c13c16057ff65',
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
          url: '/_next/static/chunks/4383.8c7f47da988b328b.js',
          revision: '8c7f47da988b328b',
        },
        {
          url: '/_next/static/chunks/4383.8c7f47da988b328b.js.map',
          revision: '0d0f9d5c1ef71fd796cbbb0114f300d5',
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
          url: '/_next/static/chunks/5239-d4e6e96d5976e34c.js',
          revision: 'd4e6e96d5976e34c',
        },
        {
          url: '/_next/static/chunks/5239-d4e6e96d5976e34c.js.map',
          revision: 'b812e396cd6db9c18a5e7a8889e475a2',
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
          url: '/_next/static/chunks/5849-340a925505783063.js',
          revision: '340a925505783063',
        },
        {
          url: '/_next/static/chunks/5849-340a925505783063.js.map',
          revision: 'bb60339060bf30663a8f4e63125f3e8b',
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
          url: '/_next/static/chunks/7051-8acc147948f88da8.js',
          revision: '8acc147948f88da8',
        },
        {
          url: '/_next/static/chunks/7051-8acc147948f88da8.js.map',
          revision: 'c29f548b6e216dbc892857b348e77a13',
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
          url: '/_next/static/chunks/7750.e3f13fc25cf26c9f.js',
          revision: 'e3f13fc25cf26c9f',
        },
        {
          url: '/_next/static/chunks/7750.e3f13fc25cf26c9f.js.map',
          revision: 'e7fd937f64409f61d00a9b410d40b4df',
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
          url: '/_next/static/chunks/905-6ea93dc9d34ad460.js',
          revision: '6ea93dc9d34ad460',
        },
        {
          url: '/_next/static/chunks/905-6ea93dc9d34ad460.js.map',
          revision: 'cbf9708869e7530e639d436272738e66',
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
          url: '/_next/static/chunks/9315.a865d275e73748a0.js',
          revision: 'a865d275e73748a0',
        },
        {
          url: '/_next/static/chunks/9315.a865d275e73748a0.js.map',
          revision: '33b7e90c06397b285f8011f0cc317c75',
        },
        {
          url: '/_next/static/chunks/9486-915783468c5ff73d.js',
          revision: '915783468c5ff73d',
        },
        {
          url: '/_next/static/chunks/9486-915783468c5ff73d.js.map',
          revision: '98e6e4536e2b05bc5915b600c7b36cf2',
        },
        {
          url: '/_next/static/chunks/9516-31177f3fad8d4f6d.js',
          revision: '31177f3fad8d4f6d',
        },
        {
          url: '/_next/static/chunks/9516-31177f3fad8d4f6d.js.map',
          revision: '16bc2d9b4f49e0767e7f264272a36d58',
        },
        {
          url: '/_next/static/chunks/960-6cb070fb3c4fca77.js',
          revision: '6cb070fb3c4fca77',
        },
        {
          url: '/_next/static/chunks/960-6cb070fb3c4fca77.js.map',
          revision: '2183040d2df19ce783ada459a3c6738b',
        },
        {
          url: '/_next/static/chunks/9764-c4b239eb68af3518.js',
          revision: 'c4b239eb68af3518',
        },
        {
          url: '/_next/static/chunks/9764-c4b239eb68af3518.js.map',
          revision: '35fd10164aad2784fff4fb7f2bc43b11',
        },
        {
          url: '/_next/static/chunks/9881-cbba37775a788c2d.js',
          revision: 'cbba37775a788c2d',
        },
        {
          url: '/_next/static/chunks/9881-cbba37775a788c2d.js.map',
          revision: '5157444e9d34196e9a096e3577f1d318',
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
          url: '/_next/static/chunks/app/(admin)/admin/layout-a60335bc17fb0701.js',
          revision: 'a60335bc17fb0701',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/layout-a60335bc17fb0701.js.map',
          revision: '6a592fd96e1b56bbfd271e5b2f932954',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-10608d3d471d0212.js',
          revision: '10608d3d471d0212',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/overview/page-10608d3d471d0212.js.map',
          revision: '831ff688c8b38b15b1c204ea5cc6fdd4',
        },
        {
          url: '/_next/static/chunks/app/(admin)/admin/page-8c56b4c4db929813.js',
          revision: '8c56b4c4db929813',
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
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-59ac0fecc8708eb0.js',
          revision: '59ac0fecc8708eb0',
        },
        {
          url: '/_next/static/chunks/app/(auth)/forgot-password/page-59ac0fecc8708eb0.js.map',
          revision: '99c45004d5df91ae5f3a32ce5e9eda77',
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
          url: '/_next/static/chunks/app/(auth)/login/page-b3a95751f7a32701.js',
          revision: 'b3a95751f7a32701',
        },
        {
          url: '/_next/static/chunks/app/(auth)/login/page-b3a95751f7a32701.js.map',
          revision: '0727fefe456e763a73724ec40f312029',
        },
        {
          url: '/_next/static/chunks/app/(auth)/register/page-789554f903de353b.js',
          revision: '789554f903de353b',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-b0e6b67fb60e84f1.js',
          revision: 'b0e6b67fb60e84f1',
        },
        {
          url: '/_next/static/chunks/app/(auth)/reset-password/page-b0e6b67fb60e84f1.js.map',
          revision: '4c2c7c7a37adfb33853c54f35b66ae33',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-4232a58d4a89aabe.js',
          revision: '4232a58d4a89aabe',
        },
        {
          url: '/_next/static/chunks/app/(auth)/signup/page-4232a58d4a89aabe.js.map',
          revision: '9a961ed64e706d89845eec10ea5181cb',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-bf38dc1a09398362.js',
          revision: 'bf38dc1a09398362',
        },
        {
          url: '/_next/static/chunks/app/(auth)/verify-email/page-bf38dc1a09398362.js.map',
          revision: 'd5219b225fd37d7a52af094323ca531f',
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
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-c875c79cd5546974.js',
          revision: 'c875c79cd5546974',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/layout-c875c79cd5546974.js.map',
          revision: 'aca1617837ea1b30e998de4e873bc5e4',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-1ba5812c84bfc522.js',
          revision: '1ba5812c84bfc522',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/notifications/page-1ba5812c84bfc522.js.map',
          revision: '57b9450970b547e3a6d040ab865a2e7e',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-93ff2d671bcdf940.js',
          revision: '93ff2d671bcdf940',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/page-93ff2d671bcdf940.js.map',
          revision: '2a9e37a88e3b189f01588b818a2d8826',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-a9a26d53fdda753f.js',
          revision: 'a9a26d53fdda753f',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/pools/page-a9a26d53fdda753f.js.map',
          revision: '5c452e90562eb74ed04ba9b4c1bb6cca',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-95a8647ad443a924.js',
          revision: '95a8647ad443a924',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/new/page-95a8647ad443a924.js.map',
          revision: '09a5e549aa40431689a78096ffdfca87',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-09d297e0d6acc7ac.js',
          revision: '09d297e0d6acc7ac',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/stakes/page-09d297e0d6acc7ac.js.map',
          revision: '814edb050d04951a02cc772ce74291e7',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-9187d6441c6c7451.js',
          revision: '9187d6441c6c7451',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/team/page-9187d6441c6c7451.js.map',
          revision: '67c074b7337cbb5c8cfe9b35f6dfd387',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-cdd028f242a81385.js',
          revision: 'cdd028f242a81385',
        },
        {
          url: '/_next/static/chunks/app/(dashboard)/dashboard/wallets/page-cdd028f242a81385.js.map',
          revision: 'aa1b5157eee1380e6c720d079774f3c2',
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
          url: '/_next/static/chunks/app/debug-auth/page-0a0edd6dd56fa8b7.js',
          revision: '0a0edd6dd56fa8b7',
        },
        {
          url: '/_next/static/chunks/app/debug-auth/page-0a0edd6dd56fa8b7.js.map',
          revision: 'c053c95eb589d276c1c94ad7dc484645',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-6dc4d31f79548312.js',
          revision: '6dc4d31f79548312',
        },
        {
          url: '/_next/static/chunks/app/debug-token/page-6dc4d31f79548312.js.map',
          revision: '8b2242a702218dba9421cce1d87152e4',
        },
        {
          url: '/_next/static/chunks/app/error-12f6aab1a5b7207d.js',
          revision: '12f6aab1a5b7207d',
        },
        {
          url: '/_next/static/chunks/app/error-12f6aab1a5b7207d.js.map',
          revision: '28dead263a31455584b461251bb4e7db',
        },
        {
          url: '/_next/static/chunks/app/global-error-c9c29ab545326ec8.js',
          revision: 'c9c29ab545326ec8',
        },
        {
          url: '/_next/static/chunks/app/global-error-c9c29ab545326ec8.js.map',
          revision: 'a3830181b522657c42f23637b7e1f1bd',
        },
        {
          url: '/_next/static/chunks/app/layout-734e8bb241707d4d.js',
          revision: '734e8bb241707d4d',
        },
        {
          url: '/_next/static/chunks/app/layout-734e8bb241707d4d.js.map',
          revision: '36f26ccdf05c275cd0e8aeba758534ac',
        },
        {
          url: '/_next/static/chunks/app/not-found-38d269c899efed9d.js',
          revision: '38d269c899efed9d',
        },
        {
          url: '/_next/static/chunks/app/not-found-38d269c899efed9d.js.map',
          revision: '273f58f2e84ff2ce0cda0a327c98262c',
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
          url: '/_next/static/chunks/main-9892363ab27a3782.js',
          revision: '9892363ab27a3782',
        },
        {
          url: '/_next/static/chunks/main-9892363ab27a3782.js.map',
          revision: 'df34dd9552cc56db29e6d2e3759ca23f',
        },
        {
          url: '/_next/static/chunks/main-app-52c647a17e63ee74.js',
          revision: '52c647a17e63ee74',
        },
        {
          url: '/_next/static/chunks/main-app-52c647a17e63ee74.js.map',
          revision: '6cc073454b3dae9b4279321b86a46a9a',
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
          url: '/_next/static/chunks/pages/_error-b579789578b8a505.js',
          revision: 'b579789578b8a505',
        },
        {
          url: '/_next/static/chunks/pages/_error-b579789578b8a505.js.map',
          revision: '854f8f999fa6313326f4d361e1d5fcd2',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-dfcbc1e6959ca163.js',
          revision: 'dfcbc1e6959ca163',
        },
        {
          url: '/_next/static/chunks/webpack-dfcbc1e6959ca163.js.map',
          revision: '115b3da08c1b8a190735d6ab816b5070',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css',
          revision: '041aafb0eaf4613c',
        },
        {
          url: '/_next/static/css/041aafb0eaf4613c.css.map',
          revision: '9802443eaf679525ea379ab5e645dbba',
        },
        {
          url: '/_next/static/css/1b4bdc46c94bdb89.css',
          revision: '1b4bdc46c94bdb89',
        },
        {
          url: '/_next/static/css/1b4bdc46c94bdb89.css.map',
          revision: '70fb7401598bb4648d938b7c3f0ff96d',
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
              event: s,
              state: c,
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

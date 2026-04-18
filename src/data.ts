export interface PreviewItem {
  type: 'image' | 'embed' | 'video' | 'note';
  src: string;
  title?: string;
  portrait?: boolean;
  aspectRatio?: string;
  rowGroup?: string;
}

export interface Project {
  id: string;
  title: string;
  iconSrc: string;
  x: number;
  y: number;
  description: string;
  details: {
    topic: string;
  };
  previews: PreviewItem[];
  previewIntro?: string;
  isPortrait?: boolean; // 新增属性，用于标记是否为竖版图标
  isLandscape?: boolean; // 新增属性，用于标记是否为宽屏/横版图标
}

export const projects: Project[] = [
  {
    id: 'ai-backpack',
    title: 'AI背包展示',
    iconSrc: '/img/works/AI背包展示/ai-generated-2026-01-03T19-03-01-300Z.png',
    x: 35,
    y: 35,
    isPortrait: true,
    description: '利用先进 AI 技术生成的背包产品展示系列。这些作品精准还原了皮革等材质的物理质感，通过精心设计的光影和背景，打造出极具商业价值的高质量产品渲染图。',
    details: {
      topic: 'AI 生成 > 产品设计 > 箱包配饰',
    },
    previews: [
      { type: 'video', src: 'https://zerinn-works.oss-cn-guangzhou.aliyuncs.com/%E6%8C%8E%E5%8C%85.mp4', aspectRatio: '3 / 4' },
      { type: 'image', src: '/img/works/AI背包展示/ai-generated-2026-01-03T19-03-01-300Z.png' },
      { type: 'image', src: '/img/works/AI背包展示/ai-generated-2026-01-04T06-01-29-815Z.png' },
      { type: 'image', src: '/img/works/AI背包展示/ai-generated-2026-01-04T07-04-34-750Z.png' },
      { type: 'image', src: '/img/works/AI背包展示/ai-generated-2026-01-05T02-20-39-532Z.png' },
      { type: 'image', src: '/img/works/AI背包展示/ai-generated-2026-01-05T03-09-00-159Z.png' }
    ]
  },
  {
    id: 'ai-clothing',
    title: 'AI服装场景展示',
    iconSrc: '/img/works/AI服装场景展示/下载 (9).jpg',
    x: 65,
    y: 40,
    isPortrait: false, // 移除竖版标记
    description: '数字时尚的前沿探索：通过 AI 构建虚拟模特的试衣场景。打破物理限制，让服装设计理念在虚拟空间中得到完美呈现，探索不同材质与剪裁的视觉表现力。',
    details: {
      topic: 'AI 生成 > 时尚设计 > 场景模拟',
    },
    previews: [
      { type: 'video', src: 'https://zerinn-works.oss-cn-guangzhou.aliyuncs.com/%E9%9B%AA%E5%9C%B0%E9%9D%B4.mp4', portrait: true, aspectRatio: '3 / 4' },
      { type: 'image', src: '/img/works/AI服装场景展示/下载 (9).jpg' },
      { type: 'image', src: '/img/works/AI服装场景展示/21.png' }
    ]
  },
  {
    id: 'ai-landrover',
    title: 'AI路虎模特交互',
    iconSrc: '/img/works/AI路虎模特交互/82cc45bd-e7fc-47e5-807e-86e5e5c2a6c7_0_1767959336779.png',
    x: 20,
    y: 60,
    isLandscape: true, // 标记为横版，以保留不被裁剪的原始比例
    description: '使用 AI 创作的路虎汽车与人物模特的场景交互视觉图。在椰林沙滩的夕阳下，展现了车辆的豪华质感与生活方式的结合，强调了品牌与自然、人物的和谐氛围。',
    details: {
      topic: 'AI 生成 > 汽车摄影 > 人车互动',
    },
    previewIntro: '用vibe coding的无限工作流画布一键批量出图，展示为部分图片内容',
    previews: [
      { type: 'image', src: '/img/works/AI路虎模特交互/54.png' },
      { type: 'image', src: '/img/works/AI路虎模特交互/82cc45bd-e7fc-47e5-807e-86e5e5c2a6c7_0_1767959336779.png' },
      { type: 'image', src: '/img/works/AI路虎模特交互/1767939368697.png' },
      { type: 'image', src: '/img/works/AI路虎模特交互/1767981062380.png' },
      { type: 'image', src: '/img/works/AI路虎模特交互/1768034641752.png' }
    ]
  },
  {
    id: 'ai-tesla-scene',
    title: 'AI特斯拉场景图',
    iconSrc: '/img/works/AI特斯拉场景图/4.png',
    x: 75,
    y: 25,
    description: '特斯拉汽车的 AI 自然环境大片。利用算法生成逼真的森林公路场景和自然光效，将特斯拉的极简主义设计与静谧的自然风光完美融合。',
    details: {
      topic: 'AI 生成 > 汽车摄影 > 环境艺术',
    },
    previews: [
      { type: 'image', src: '/img/works/AI特斯拉场景图/4.png' },
      { type: 'image', src: '/img/works/AI特斯拉场景图/6.png' }
    ]
  },
  {
    id: 'ai-tesla-studio',
    title: 'AI特斯拉棚拍',
    iconSrc: '/img/works/AI特斯拉棚拍/upscale_the_image_keep_all_de_73dd247341769d77fa3f1a99da9cd021.jpg',
    x: 50,
    y: 65,
    description: '突破传统汽车摄影限制的 AI 棚拍作品。通过对虚拟影棚光源的精准控制，勾勒出特斯拉车身独特的流线型设计语言，展现极具冲击力的高级金属质感。',
    details: {
      topic: 'AI 生成 > 商业摄影 > 影棚渲染',
    },
    previews: [
      { type: 'image', src: '/img/works/AI特斯拉棚拍/PixPin_2026-04-16_23-58-56.gif' },
      { type: 'image', src: '/img/works/AI特斯拉棚拍/upscale_the_image_keep_all_de_46fac43d53d42dc62e7e8bf2cac46a21.jpg' },
      { type: 'image', src: '/img/works/AI特斯拉棚拍/upscale_the_image_keep_all_de_73dd247341769d77fa3f1a99da9cd021.jpg' },
      { type: 'image', src: '/img/works/AI特斯拉棚拍/upscale_the_image_keep_all_de_94b5bd992b2f4963d0516f449a8738b8.jpg' },
      { type: 'image', src: '/img/works/AI特斯拉棚拍/upscale_the_image_keep_all_de_95261a70c3eadb4898cb5f3185bd2631.jpg' },
      { type: 'image', src: '/img/works/AI特斯拉棚拍/upscale_the_image_keep_all_de_ad183f2c3b353530940fcdb827873b4d.jpg' },
      { type: 'image', src: '/img/works/AI特斯拉棚拍/upscale_the_image_keep_all_de_ca1b8d7759f1ba09723f671406686aa7.jpg' }
    ]
  },
  {
    id: 'ai-toys',
    title: 'AI玩具电商图',
    iconSrc: '/img/works/AI玩具电商图/1768131026075.jpg',
    x: 80,
    y: 75,
    description: '结合 AI 工作流打造的精美玩具电商视觉图，一键批量生成。以丰富的色彩、极具童趣的背景布置，呈现出玩具最吸引人的一面。',
    details: {
      topic: 'AI 生成 > 商业摄影 > 电商视觉',
    },
    previewIntro: '用vibe coding的无限工作流画布一键批量出图，展示为部分图片内容',
    previews: [
      { type: 'image', src: '/img/works/AI玩具电商图/image.png' },
      { type: 'image', src: '/img/works/AI玩具电商图/1768130590551.jpg' },
      { type: 'image', src: '/img/works/AI玩具电商图/1768131381645.jpg' },
      { type: 'image', src: '/img/works/AI玩具电商图/1768131834283.jpg' }
    ]
  },
  {
    id: 'ai-live-drama',
    title: 'AI真人微电影预告',
    iconSrc: '/img/works/AI真人短剧/岳飞(3)(1).png',
    x: 15,
    y: 30,
    isPortrait: true,
    description: '利用 AI 技术生成的真人微电影预告片。以历史人物为主题，通过 AI 还原古代人物的神态与服饰细节，打造出具有电影质感的微电影预告视觉素材。',
    details: {
      topic: 'AI 生成 > 影视创作 > 微电影预告',
    },
    previews: [
      { type: 'video', src: 'https://zerinn-works.oss-cn-guangzhou.aliyuncs.com/%E5%B2%B3%E9%A3%9E.mp4', aspectRatio: '2542 / 1080' },
      { type: 'image', src: '/img/works/AI真人短剧/image.png' },
      { type: 'image', src: '/img/works/AI真人短剧/岳飞(3)(1).png' },
      { type: 'image', src: '/img/works/AI真人短剧/generated_image_b608c4db-4007-4f67-90a5-118ef1041973.png' },
      { type: 'image', src: '/img/works/AI真人短剧/generated-1765725870657.png' },
      { type: 'image', src: '/img/works/AI真人短剧/PureRef-copy-2025.12.13-13.28.58.png' }
    ]
  },
  {
    id: 'ai-live-drama-case',
    title: 'AI真人短剧案例',
    iconSrc: '/img/works/AI真人短剧案例/thumbnail.png',
    x: 28,
    y: 58,
    isPortrait: true,
    description: '基于 AI 生成技术打造的真人短剧案例展示。聚焦人物特写、情绪表达与电影感镜头语言，呈现适用于短剧包装与内容宣传的视觉样片。',
    details: {
      topic: 'AI 生成 > 影视创作 > 真人短剧案例',
    },
    previewIntro: '剧本部分：工具使用Claude Code+opus4.6模型，主agent作为写手，创建并调用2个subagent读取对应skills作为审核和进度记录从而保证长剧集下的一致性。\n\n剧本到成片部分：和剧本方式一样是使用subagent的方式进行创作，创建3个子代理分别担任导演、美术设计和分镜师的角色对上传的剧本进行拆解产出。',
    previews: [
      { type: 'video', src: 'https://zerinn-works.oss-cn-guangzhou.aliyuncs.com/%E7%AC%AC%E4%B8%80%E9%9B%86.mp4', rowGroup: 'case-video-row', title: '第一集', portrait: true, aspectRatio: '9 / 16' },
      { type: 'video', src: 'https://zerinn-works.oss-cn-guangzhou.aliyuncs.com/%E7%AC%AC%E4%BA%8C%E9%9B%86.mp4', rowGroup: 'case-video-row', title: '第二集', portrait: true, aspectRatio: '9 / 16' },
      { type: 'video', src: 'https://zerinn-works.oss-cn-guangzhou.aliyuncs.com/%E7%AC%AC%E4%B8%89%E9%9B%86.mp4', rowGroup: 'case-video-row', title: '第三集', portrait: true, aspectRatio: '9 / 16' },
      { type: 'image', src: '/img/作品图/AI真人短剧案例/a7fb7c45-e054-473d-95bd-95f567e42001.png', rowGroup: 'case-pair-1' },
      { type: 'image', src: '/img/作品图/AI真人短剧案例/image copy 6.png', rowGroup: 'case-pair-1' },
      { type: 'note', src: '', title: '后续为了方便手搓了一个短剧工作台，从剧本到Seedance2.0视频提示词的全流程，包括人物角色图，场景图生成，分镜宫格图生成等方面（当时seedance2.0的api还没开放所以暂时没有接入）' },
      { type: 'image', src: '/img/works/AI真人短剧案例/image copy 2.png', rowGroup: 'case-pair-2' },
      { type: 'image', src: '/img/works/AI真人短剧案例/image copy 3.png', rowGroup: 'case-pair-2' },
      { type: 'image', src: '/img/works/AI真人短剧案例/image copy 4.png', rowGroup: 'case-pair-3' },
      { type: 'image', src: '/img/works/AI真人短剧案例/image copy 5.png', rowGroup: 'case-pair-3' }
    ]
  },
  {
    id: 'ai-car-studio',
    title: 'AI人车棚拍',
    iconSrc: '/img/works/AI人车棚拍/generate_a_high_fashion_photog_03921f4767a71cb7d265893113d18149.jpg',
    x: 40,
    y: 20,
    description: '融合高端时尚摄影与汽车棚拍的 AI 创作系列。通过精准的影棚布光与人物造型，将汽车与模特完美结合，呈现出兼具商业质感与艺术表现力的人车互动大片。',
    details: {
      topic: 'AI 生成 > 商业摄影 > 人车棚拍',
    },
    previews: [
      { type: 'image', src: '/img/works/AI人车棚拍/image.png' },
      { type: 'image', src: '/img/works/AI人车棚拍/generate_a_high_fashion_photog_03921f4767a71cb7d265893113d18149.jpg' },
      { type: 'image', src: '/img/works/AI人车棚拍/highly_realistic_image_perfec_0c4d5392a640b05cdf90b4cb78381389.jpg' },
      { type: 'image', src: '/img/works/AI人车棚拍/highly_realistic_image_perfec_0f12667e411cb07da634eda609c7ca39.jpg' },
      { type: 'image', src: '/img/works/AI人车棚拍/highly_realistic_image_perfec_2aa93e61155f56b8e11463fd5252d919.jpg' },
      { type: 'image', src: '/img/works/AI人车棚拍/highly_realistic_image_perfec_2e36772e4f60c88a20c3a6f6dc538ee1.jpg' },
      { type: 'image', src: '/img/works/AI人车棚拍/highly_realistic_image_perfec_34b4e980141d2b9ae38d5f1dbfdde91f.jpg' },
      { type: 'image', src: '/img/works/AI人车棚拍/highly_realistic_image_perfec_7888087da70fc31a86a7a91711c9395f.jpg' },
      { type: 'image', src: '/img/works/AI人车棚拍/highly_realistic_image_perfec_78e97483997456b8ef4265a3a65bc835.jpg' }
    ]
  },
  {
    id: 'ai-fashion-studio',
    title: 'AI真人服装棚拍',
    iconSrc: '/img/works/AI真人服装棚拍/show_me_a_high_fashion_photosh_67ddce9cc90bb0e18f6f04913b70dff4.jpg',
    x: 55,
    y: 45,
    description: '以 AI 驱动的高端时尚棚拍系列。通过虚拟影棚精准控光，还原真人模特的肌肤质感与服装面料细节，打造出媲美专业摄影棚的时尚大片效果。',
    details: {
      topic: 'AI 生成 > 时尚摄影 > 服装棚拍',
    },
    previews: [
      { type: 'image', src: '/img/works/AI真人服装棚拍/PixPin_2026-04-17_13-41-31.gif' },
      { type: 'image', src: '/img/works/AI真人服装棚拍/show_me_a_high_fashion_photosh_67ddce9cc90bb0e18f6f04913b70dff4.jpg' },
      { type: 'image', src: '/img/works/AI真人服装棚拍/show_me_a_high_fashion_photosh_c0dca5a5d54342cbbed87702064ee687.jpg' },
      { type: 'image', src: '/img/works/AI真人服装棚拍/analyze_the_input_image_and_si_1ed69dc8583afaa128f9e0acb054dfae.jpg' },
      { type: 'image', src: '/img/works/AI真人服装棚拍/upscale_and_expand_the_image_2e50cdb0f30d33a628554e8807d33033.jpg' },
      { type: 'image', src: '/img/works/AI真人服装棚拍/1_1_2_fae926b997c2496b8b400ff2d3fa7e64.jpg' }
    ]
  }
];

export interface SiteContactConfig {
  name: string
  title: string
  subtitle: string
  tagline: string
  positioning: {
    role: string
    pillars: string[]
    markets: string[]
  }
  location: {
    city: string
    country: string
    full: string
  }
  contact: {
    primaryPhone: {
      display: string
      raw: string
      tel: string
      label: string
    }
    realEstatePhone: {
      display: string
      raw: string
      tel: string
      label: string
    }
    whatsapp: {
      display: string
      raw: string
      url: string
      label: string
    }
    primaryEmail: {
      address: string
      mailto: string
      label: string
    }
    publicEmail: {
      address: string
      mailto: string
      label: string
    }
  }
  websites: Array<{
    name: string
    url: string
    description?: string
  }>
  socials: Array<{
    platform: 'LinkedIn' | 'Facebook' | 'Instagram' | 'YouTube' | 'Telegram' | 'Linktree'
    name: string
    url: string
    handle?: string
  }>
  publicForms: Array<{
    title: string
    purpose: string
    url: string
  }>
}

export const SITE_CONFIG: SiteContactConfig = {
  name: 'Cristian Văduva',
  title: 'Cristian Văduva | Luxury Real Estate & Advisory',
  subtitle: 'Private Real Estate · Insurance Asset Protection · Capital Advisory',
  tagline: 'Luxury Real Estate Expert & Capital Placement Advisory',
  positioning: {
    role: 'Luxury Real Estate Expert',
    pillars: ['Real Estate', 'Insurance / Asset Protection', 'Investments'],
    markets: ['Monaco', 'Dubai', 'Bucharest'],
  },
  location: {
    city: 'Bucharest',
    country: 'Romania',
    full: 'Bucharest, Romania',
  },
  contact: {
    primaryPhone: {
      display: '+40 767 110 439',
      raw: '+40767110439',
      tel: 'tel:+40767110439',
      label: 'Primary Phone',
    },
    realEstatePhone: {
      display: '+43 650 953 6345',
      raw: '+436509536345',
      tel: 'tel:+436509536345',
      label: 'Real-Estate Direct',
    },
    whatsapp: {
      display: '+43 650 953 6345',
      raw: '436509536345',
      url: 'https://wa.me/436509536345',
      label: 'WhatsApp Direct',
    },
    primaryEmail: {
      address: 'cristianvaduva@duck.com',
      mailto: 'mailto:cristianvaduva@duck.com',
      label: 'Primary Direct Email',
    },
    publicEmail: {
      address: 'contact@cristianvaduva.com',
      mailto: 'mailto:contact@cristianvaduva.com',
      label: 'Public Advisory Inquiries',
    },
  },
  websites: [
    {
      name: 'CristianVaduva.com',
      url: 'https://cristianvaduva.com',
      description: 'Official Private Practice & Advisory Portal',
    },
    {
      name: 'AiXLuxury',
      url: 'https://aixluxury.com',
      description: 'Ultra-Prime Asset & Luxury Advisory',
    },
    {
      name: 'HomeFind',
      url: 'https://homefind.cristianvaduva.com',
      description: 'Curated Real Estate Search & Buyer Mandates',
    },
    {
      name: 'Insurance',
      url: 'https://insurance.cristianvaduva.com',
      description: 'Risk Engineering & Asset Protection',
    },
    {
      name: 'Credit',
      url: 'https://credite.cristianvaduva.com',
      description: 'Mortgage & Private Credit Structuring',
    },
    {
      name: 'AiX Media',
      url: 'https://aixmedia.cristianvaduva.com',
      description: 'Digital Production & Editorial Marketing',
    },
    {
      name: 'AiX OS',
      url: 'https://os.aixluxury.com',
      description: 'Executive Operating System',
    },
    {
      name: 'Telegram Channel',
      url: 'https://t.me/capitalinvestcristianvaduva',
      description: 'Capital Investments & Market Dispatches',
    },
    {
      name: 'Linktree',
      url: 'https://linktr.ee/cristianvaduvarealestate',
      description: 'Direct Links & Fast Access Hub',
    },
  ],
  socials: [
    {
      platform: 'LinkedIn',
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/cristianv%C4%83duva/',
      handle: 'cristianvăduva',
    },
    {
      platform: 'Facebook',
      name: 'Facebook',
      url: 'https://www.facebook.com/CristianVaduvaCV',
      handle: 'CristianVaduvaCV',
    },
    {
      platform: 'Instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/cristian_vaduva_cristianv/',
      handle: '@cristian_vaduva_cristianv',
    },
    {
      platform: 'YouTube',
      name: 'YouTube',
      url: 'https://www.youtube.com/@CristianVaduvaCV',
      handle: '@CristianVaduvaCV',
    },
    {
      platform: 'Telegram',
      name: 'Telegram',
      url: 'https://t.me/capitalinvestcristianvaduva',
      handle: '@capitalinvestcristianvaduva',
    },
    {
      platform: 'Linktree',
      name: 'Linktree',
      url: 'https://linktr.ee/cristianvaduvarealestate',
      handle: 'cristianvaduvarealestate',
    },
  ],
  publicForms: [
    {
      title: 'Sell / Buy Property Form',
      purpose: 'Direct acquisition mandate or property sale submission',
      url: 'https://form.jotform.com/260995822821061',
    },
    {
      title: 'Insurance Advisory Form',
      purpose: 'Risk analysis, property coverage, and asset protection',
      url: 'https://form.jotform.com/260995914926069',
    },
    {
      title: 'Club Membership Form',
      purpose: 'Private club membership and confidential investor network',
      url: 'https://form.jotform.com/252405778959070',
    },
  ],
}

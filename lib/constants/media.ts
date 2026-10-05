import { IMAGES } from './images';
import { EXTERNAL_LINKS } from './links';

export const MEDIA_OUTLETS = [
  {
    name: 'MagicBricks',
    href: EXTERNAL_LINKS.MEDIA.MAGICBRICKS,
    image: IMAGES.MEDIA.MAGICBRICKS,
    containerClassName: 'h-[22px] w-[71px] bg-[#d8232a] p-[5px]',
    imageClassName: 'h-full w-full object-contain',
    layoutClassName: 'md:col-span-2 lg:col-span-1',
  },
  {
    name: 'Indian Startup News',
    href: EXTERNAL_LINKS.MEDIA.INDIAN_STARTUP_NEWS,
    image: IMAGES.MEDIA.INDIAN_STARTUP_NEWS,
    containerClassName: 'h-[26px] w-[41px]',
    imageClassName: 'h-full w-full object-cover',
    layoutClassName: 'md:col-span-2 lg:col-span-1',
  },
  {
    name: 'NDTV Profit',
    href: EXTERNAL_LINKS.MEDIA.NDTV_PROFIT,
    image: IMAGES.MEDIA.NDTV_PROFIT,
    containerClassName: 'h-6 w-[117px] overflow-hidden',
    imageClassName: 'relative -top-[193%] h-[488%] w-full max-w-none',
    layoutClassName: 'md:col-span-2 lg:col-span-1',
  },
  {
    name: 'IBS Intelligence',
    href: EXTERNAL_LINKS.MEDIA.IBS_INTELLIGENCE,
    image: IMAGES.MEDIA.IBS_INTELLIGENCE,
    containerClassName: 'h-[22px] w-[67px] overflow-hidden',
    imageClassName: 'relative -top-[102%] h-[304%] w-full max-w-none',
    layoutClassName: 'md:col-span-2 lg:col-span-1',
  },
  {
    name: 'SugerMint',
    href: EXTERNAL_LINKS.MEDIA.SUGERMINT,
    image: IMAGES.MEDIA.SUGERMINT,
    containerClassName: 'h-[22px] w-[97px]',
    imageClassName: 'h-full w-full object-cover',
    layoutClassName: 'md:col-span-2 lg:col-span-1',
  },
  {
    name: 'MakeMoney.ng',
    href: EXTERNAL_LINKS.MEDIA.MAKEMONEY,
    image: IMAGES.MEDIA.MAKEMONEY,
    containerClassName: 'h-[22px] w-[73px]',
    imageClassName: 'h-full w-full object-cover',
    layoutClassName: 'md:col-span-2 lg:col-span-1',
  },
  {
    name: 'StartupTalky',
    href: EXTERNAL_LINKS.MEDIA.STARTUPTALKY,
    image: IMAGES.MEDIA.STARTUPTALKY,
    containerClassName: 'h-7 w-[39px]',
    imageClassName: 'h-full w-full object-cover',
    layoutClassName: 'md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto',
  },
  {
    name: 'Jagran',
    href: EXTERNAL_LINKS.MEDIA.JAGRAN,
    image: IMAGES.MEDIA.JAGRAN,
    containerClassName: 'h-7 w-[45px] overflow-hidden',
    imageClassName: 'relative -top-[31%] h-[157%] w-full max-w-none',
    layoutClassName: 'md:col-span-2 lg:col-span-1',
  },
] as const;

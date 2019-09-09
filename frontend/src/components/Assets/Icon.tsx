import * as React from 'react';
import './Icon.module.less';

/* image */
const Libeo = React.lazy(() => import('assets/images/libeo_logo.svg') as any);
const Logo = React.lazy(() => import('assets/images/main_logo.svg') as any);
const InvoiceScan = React.lazy(
  () => import('assets/images/scan-facture.svg') as any,
);
const InvoiceUpload = React.lazy(
  () => import('assets/images/upload-invoice.svg') as any,
);
const Hello = React.lazy(
  () => import('assets/images/undraw_hello_aeia.svg') as any,
);
const NoData0 = React.lazy(
  () => import('assets/images/table-no-data-0.svg') as any,
);
const NoData1 = React.lazy(
  () => import('assets/images/table-no-data-1.svg') as any,
);
const NoData2 = React.lazy(
  () => import('assets/images/table-no-data-2.svg') as any,
);
const Question = React.lazy(() => import('assets/images/question.svg') as any);
const InsufficientMoney = React.lazy(
  () => import('assets/images/insufficient-money.svg') as any,
);
const CompleteOnboarding = React.lazy(
  () => import('assets/images/complete-onboarding.svg') as any,
);
const OnboardingRefused = React.lazy(
  () => import('assets/images/onboarding-refused.svg') as any,
);
const OnboardingStart = React.lazy(
  () => import('assets/images/onboarding-start.svg') as any,
);
const OnboardingWaiting = React.lazy(
  () => import('assets/images/onboarding-waiting.svg') as any,
);

/* icons */
const Alarm = React.lazy(() => import('assets/icons/alarm.svg') as any);
const Alert = React.lazy(() => import('assets/icons/alert.svg') as any);
const ArrowDown = React.lazy(
  () => import('assets/icons/arrow-down.svg') as any,
);
const ArrowReturn = React.lazy(
  () => import('assets/icons/arrow-return.svg') as any,
);
const ArrowThinLeft = React.lazy(
  () => import('assets/icons/arrow-thin-left.svg') as any,
);
const ArrowUp = React.lazy(() => import('assets/icons/arrow-up.svg') as any);
const Bell = React.lazy(() => import('assets/icons/bell.svg') as any);
const Blog = React.lazy(() => import('assets/icons/blog.svg') as any);
const Briefcase = React.lazy(() => import('assets/icons/briefcase.svg') as any);
const Buy = React.lazy(() => import('assets/icons/buy.svg') as any);
const Change = React.lazy(() => import('assets/icons/change.svg') as any);
const Checkmark = React.lazy(() => import('assets/icons/checkmark.svg') as any);
const ChevronDown = React.lazy(
  () => import('assets/icons/chevron-down.svg') as any,
);
const ChevronLeft = React.lazy(
  () => import('assets/icons/chevron-left.svg') as any,
);
const ChevronRight = React.lazy(
  () => import('assets/icons/chevron-right.svg') as any,
);
const Clock = React.lazy(() => import('assets/icons/clock.svg') as any);
const Clockwise = React.lazy(() => import('assets/icons/clockwise.svg') as any);
const CloudUpload = React.lazy(
  () => import('assets/icons/cloud-upload.svg') as any,
);
const Conversation = React.lazy(
  () => import('assets/icons/conversation.svg') as any,
);
const Cross = React.lazy(() => import('assets/icons/cross.svg') as any);
const Dots3 = React.lazy(() => import('assets/icons/dots-3.svg') as any);
const Download = React.lazy(() => import('assets/icons/download.svg') as any);
const Edit = React.lazy(() => import('assets/icons/edit.svg') as any);
const EmptySearch = React.lazy(
  () => import('assets/icons/empty_search.svg') as any,
);
const Export = React.lazy(() => import('assets/icons/export.svg') as any);
const EyeOpen = React.lazy(() => import('assets/icons/eye_open.svg') as any);
const Facture = React.lazy(() => import('assets/icons/facture.svg') as any);
const Gear = React.lazy(() => import('assets/icons/gear.svg') as any);
const Graduation = React.lazy(
  () => import('assets/icons/graduation.svg') as any,
);
const Heart = React.lazy(() => import('assets/icons/heart.svg') as any);
const Help = React.lazy(() => import('assets/icons/help.svg') as any);
const Home = React.lazy(() => import('assets/icons/home.svg') as any);
const Information = React.lazy(
  () => import('assets/icons/information.svg') as any,
);
const LibeoCheckMark = React.lazy(
  () => import('assets/icons/libeo.svg') as any,
);
const Lock = React.lazy(() => import('assets/icons/lock.svg') as any);
const LogoMini = React.lazy(() => import('assets/icons/Logo_mini.svg') as any);
const Menu = React.lazy(() => import('assets/icons/menu.svg') as any);
const Network = React.lazy(() => import('assets/icons/network.svg') as any);
const Paper = React.lazy(() => import('assets/icons/paper.svg') as any);
const Pencil = React.lazy(() => import('assets/icons/pencil.svg') as any);
const Plus = React.lazy(() => import('assets/icons/plus.svg') as any);
const Profile = React.lazy(() => import('assets/icons/profile.svg') as any);
const Pulse = React.lazy(() => import('assets/icons/pulse.svg') as any);
const Rocket = React.lazy(() => import('assets/icons/rocket.svg') as any);
const Search = React.lazy(() => import('assets/icons/search.svg') as any);
const Sell = React.lazy(() => import('assets/icons/sell.svg') as any);
const Share = React.lazy(() => import('assets/icons/share.svg') as any);
const Stat = React.lazy(() => import('assets/icons/stat.svg') as any);
const Tag = React.lazy(() => import('assets/icons/tag.svg') as any);
const ThumbsUp = React.lazy(() => import('assets/icons/thumbs-up.svg') as any);
const TimeReverse = React.lazy(
  () => import('assets/icons/time-reverse.svg') as any,
);
const Trash = React.lazy(() => import('assets/icons/trash.svg') as any);
const UserGroup = React.lazy(
  () => import('assets/icons/user-group.svg') as any,
);
const WalletOut = React.lazy(
  () => import('assets/icons/wallet-out.svg') as any,
);
const Wallet = React.lazy(() => import('assets/icons/wallet.svg') as any);
const Warning = React.lazy(() => import('assets/icons/warning.svg') as any);

const Svgs: any = {
  Alarm,
  Alert,
  ArrowDown,
  ArrowReturn,
  ArrowThinLeft,
  ArrowUp,
  Bell,
  Blog,
  Briefcase,
  Buy,
  Change,
  Checkmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clockwise,
  CloudUpload,
  CompleteOnboarding,
  Conversation,
  Cross,
  Dots3,
  Download,
  Edit,
  EmptySearch,
  Export,
  EyeOpen,
  Facture,
  Gear,
  Graduation,
  Heart,
  Hello,
  Help,
  Home,
  Information,
  InsufficientMoney,
  InvoiceScan,
  InvoiceUpload,
  Libeo,
  LibeoCheckMark,
  Lock,
  Logo,
  LogoMini,
  Menu,
  Network,
  NoData0,
  NoData1,
  NoData2,
  OnboardingRefused,
  OnboardingStart,
  OnboardingWaiting,
  Paper,
  Pencil,
  Plus,
  Profile,
  Pulse,
  Question,
  Rocket,
  Search,
  Sell,
  Share,
  Stat,
  Tag,
  ThumbsUp,
  TimeReverse,
  Trash,
  UserGroup,
  Wallet,
  WalletOut,
  Warning,
};

export enum IconValue {
  Alarm = 'Alarm',
  Alert = 'Alert',
  ArrowDown = 'ArrowDown',
  ArrowReturn = 'ArrowReturn',
  ArrowThinLeft = 'ArrowThinLeft',
  ArrowUp = 'ArrowUp',
  Bell = 'Bell',
  Blog = 'Blog',
  Briefcase = 'Briefcase',
  Buy = 'Buy',
  Change = 'Change',
  Checkmark = 'Checkmark',
  ChevronDown = 'ChevronDown',
  ChevronLeft = 'ChevronLeft',
  ChevronRight = 'ChevronRight',
  Clock = 'Clock',
  Clockwise = 'Clockwise',
  CloudUpload = 'CloudUpload',
  CompleteOnboarding = 'CompleteOnboarding',
  CompleteRefused = 'CompleteRefused',
  Conversation = 'Conversation',
  Cross = 'Cross',
  Dots3 = 'Dots3',
  Download = 'Download',
  Edit = 'Edit',
  EmptySearch = 'EmptySearch',
  EyeOpen = 'EyeOpen',
  Export = 'Export',
  Facture = 'Facture',
  Gear = 'Gear',
  Graduation = 'Graduation',
  Heart = 'Heart',
  Hello = 'Hello',
  Help = 'Help',
  Home = 'Home',
  Information = 'Information',
  InsufficientMoney = 'InsufficientMoney',
  InvoiceScan = 'InvoiceScan',
  InvoiceUpload = 'InvoiceUpload',
  Libeo = 'Libeo',
  LibeoCheckMark = 'LibeoCheckMark',
  Lock = 'Lock',
  LogoMini = 'LogoMini',
  Menu = 'Menu',
  Logo = 'Logo',
  Network = 'Network',
  NoData0 = 'NoData0',
  NoData1 = 'NoData1',
  NoData2 = 'NoData2',
  OnboardingRefused = 'OnboardingRefused',
  OnboardingStart = 'OnboardingStart',
  OnboardingWaiting = 'OnboardingWaiting',
  Paper = 'Paper',
  Pencil = 'Pencil',
  Plus = 'Plus',
  Profile = 'Profile',
  Pulse = 'Pulse',
  Question = 'Question',
  Rocket = 'Rocket',
  Search = 'Search',
  Sell = 'Sell',
  Share = 'Share',
  Stat = 'Stat',
  ThumbsUp = 'ThumbsUp',
  Tag = 'Tag',
  TimeReverse = 'TimeReverse',
  Trash = 'Trash',
  UserGroup = 'UserGroup',
  Wallet = 'Wallet',
  WalletOut = 'WalletOut',
  Warning = 'Warning',
}
import Skeleton from 'components/Skeleton';

export interface IDefaultProps extends React.HTMLProps<HTMLElement> {
  value?: IconValue;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

const defaultProps = {
  color: '#0053FA',
  style: undefined,
  value: IconValue,
};

const IDefault: React.FunctionComponent<IDefaultProps> = ({
  value,
  style,
  className,
  ...props
}) => {
  const Svg: any = value && Svgs[value];

  return (
    <React.Suspense
      fallback={
        <Skeleton.Bloc transparent loading style={style}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            width="100%"
            height="1px"
          >
            <rect x="0" y="0" width="1" height="1" />
          </svg>
        </Skeleton.Bloc>
      }
    >
      <Svg {...defaultProps} className={className} {...props} style={style} />
    </React.Suspense>
  );
};

export default IDefault;

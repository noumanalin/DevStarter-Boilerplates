import { AndroidIcon, BraveIcon, ChromeIcon, DesktopIcon, EdgeIcon, FirefoxIcon, GlobeIcon, LinuxIcon, MacOSIcon, MobileIcon, OperaIcon, SafariIcon, UbuntuIcon, WindowsIcon } from "../../components/myAuth/ui/icons"


const DashboardHome = () => {
  return (
    <div>
      Dashboard Home

      <div className="flex gap-3">
        <DesktopIcon />
      <MobileIcon />
      <ChromeIcon />
      <FirefoxIcon/>
      <EdgeIcon/>
      <SafariIcon/>
      <BraveIcon/>
      <OperaIcon/>
      <GlobeIcon/>

      <UbuntuIcon/>
      <WindowsIcon/>
      <LinuxIcon/>
      <MacOSIcon/>
      <AndroidIcon/>
      </div>

    </div>
  )
}

export default DashboardHome

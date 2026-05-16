import { BrandLogo } from '@/components/layout/brand-logo';
import { AppLink } from '@/components/ui/app-link';
import { footerNav } from '@/config/nav';
import { siteConfig } from '@/config/site';

function PublicFooter(): React.JSX.Element {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 md:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(0,1fr))] lg:px-8">
        <div className="max-w-xs">
          <BrandLogo className="text-white hover:text-white" />
          <p className="mt-4 text-sm leading-6 text-zinc-400">{siteConfig.tagline}</p>
        </div>

        {footerNav.map((group) => (
          <div key={group.title}>
            <h2 className="text-sm font-medium text-white">{group.title}</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
              {group.links.map((item) => (
                <li key={item.href}>
                  <AppLink
                    href={item.href}
                    event={`footer.${group.title.toLowerCase()}`}
                    className="hover:text-white"
                  >
                    {item.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

export { PublicFooter };

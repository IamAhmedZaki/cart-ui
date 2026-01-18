import { Instagram, Facebook, Linkedin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#f9c821] text-black border-t border-white/10">
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">

          {/* Brand Column */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-black tracking-wider">CLUB PRO GOLF</h3>
            <p className="text-sm text-black leading-relaxed">
              Enhancing your golf experience with premium accessories since 1989. Quality you can trust, style you can feel.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-widest uppercase">Shop</h4>
            <ul className="space-y-2 text-sm text-black">
              <li className="hover:text-black/80 transition-colors cursor-pointer">Club Car</li>
              <li className="hover:text-black/80 transition-colors cursor-pointer">EZ-GO</li>
              <li className="hover:text-black/80 transition-colors cursor-pointer">Yamaha</li>
              <li className="hover:text-black/80 transition-colors cursor-pointer">New Arrivals</li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-widest uppercase">Support</h4>
            <ul className="space-y-2 text-sm text-black">
              <li className="hover:text-black/80 transition-colors cursor-pointer">Contact Us</li>
              <li className="hover:text-black/80 transition-colors cursor-pointer">Shipping Policy</li>
              <li className="hover:text-black/80 transition-colors cursor-pointer">Returns</li>
              <li className="hover:text-black/80 transition-colors cursor-pointer">FAQ</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm tracking-widest uppercase">Connect</h4>
            <div className="flex flex-col gap-3">
              <a href="mailto:INFO@CLUBPRO.COM" className="flex items-center gap-2 text-sm text-black hover:text-black/80 transition-colors">
                <Mail className="w-4 h-4" /> INFO@CLUBPRO.COM
              </a>
              <a href="tel:18004672844" className="flex items-center gap-2 text-sm text-black hover:text-black/80 transition-colors">
                <Phone className="w-4 h-4" /> 1-800-467-2844
              </a>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {[Instagram, Facebook, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="bg-black hover:bg-black/80 p-2 rounded-full transition-all duration-300 group">
                  <Icon className="w-4 h-4 text-white group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-black">
          <p>© {new Date().getFullYear()} Club Pro Golf. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-black/80 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-black/80 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X, Leaf, LogOut, Settings, ChevronDown } from "lucide-react";
import { MegaMenu } from "@/components/navigation/MegaMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestCart } from "@/hooks/useGuestCart";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { AuthModal } from "@/components/auth/AuthModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const { cartCount } = useGuestCart();
  const { storeName } = useStoreSettings();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/", hasMegaMenu: false },
    { name: "Shop", href: "/shop", hasMegaMenu: true },
    { name: "Blog", href: "/blog", hasMegaMenu: false },
    { name: "About", href: "/about", hasMegaMenu: false },
    { name: "Contact", href: "/contact", hasMegaMenu: false },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border/30 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0">
            <div className="relative transform transition-all duration-300 group-hover:scale-110">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-2.5 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:from-primary/15 group-hover:to-primary/10 border border-primary/10">
                <img 
                  src="/logo.png" 
                  alt={`${storeName} Logo`} 
                  className="h-8 sm:h-10 w-auto transition-transform duration-300 group-hover:rotate-6"
                />
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-base sm:text-xl md:text-2xl font-bold text-foreground tracking-tight transition-colors duration-300 group-hover:text-primary leading-none">
                {storeName}
              </span>
              <span className="text-xs md:text-sm text-muted-foreground font-medium">Premium Herbs</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-grow">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative group"
              >
                {item.hasMegaMenu ? (
                  <div
                    onMouseEnter={() => setIsMegaMenuOpen(true)}
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                    className="relative"
                  >
                    <Link
                      to={item.href}
                      className="relative px-4 lg:px-5 py-2.5 text-sm lg:text-base text-foreground hover:text-primary transition-all duration-300 font-semibold group/nav flex items-center space-x-1.5 rounded-lg hover:bg-primary/5"
                    >
                      <span className="relative z-10">{item.name}</span>
                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover/nav:rotate-180" />
                    </Link>
                    <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className="relative px-4 lg:px-5 py-2.5 text-sm lg:text-base text-foreground hover:text-primary transition-all duration-300 font-semibold rounded-lg hover:bg-primary/5 group/nav"
                  >
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-md mx-4">
            <form onSubmit={handleSearch} className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:shadow-lg rounded-lg transition-all duration-300"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 sm:h-11 w-10 sm:w-11 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300 hover:scale-105" data-testid="button-user-profile">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center w-full">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="h-10 sm:h-11 w-10 sm:w-11 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300 hover:scale-105" asChild data-testid="button-auth-login">
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="h-10 sm:h-11 w-10 sm:w-11 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300 relative hover:scale-105" asChild data-testid="button-cart">
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 text-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-300 hover:scale-105"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-2 sm:pb-3 border-t border-border/20 mt-2">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-muted/20 border border-muted/50 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:shadow-md rounded-lg transition-all duration-300"
              data-testid="input-mobile-search"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-border/20 animate-fade-in max-h-[calc(100vh-110px)] sm:max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-0.5">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 sm:px-4 py-2.5 sm:py-3 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-300 group font-medium min-h-[44px] flex items-center"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`link-nav-${item.name.toLowerCase()}`}
              >
                <span className="relative">
                  {item.name}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
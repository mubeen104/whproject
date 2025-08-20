import { useState } from "react";
import { Search, ShoppingBag, User, Menu, X, Leaf, LogOut, Settings } from "lucide-react";
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
  const { user, signOut, isAdmin } = useAuth();
  const { cartCount } = useGuestCart();
  const { storeName } = useStoreSettings();
  const navigate = useNavigate();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Contact Us", href: "/contact" },
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
    <header className="bg-white shadow-lg border-b border-border sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <div className="relative transform transition-all duration-300 hover:scale-105">
              <div className="bg-primary/5 rounded-xl p-3 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:bg-primary/10">
                <img 
                  src="/logo.png" 
                  alt={`${storeName} Logo`} 
                  className="h-10 w-auto transition-transform duration-300 group-hover:rotate-12"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold text-foreground tracking-tight transition-colors duration-300 group-hover:text-primary">
                {storeName}
              </span>
              <div className="h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-500"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="relative px-6 py-3 text-foreground hover:text-primary transition-all duration-300 font-semibold group"
              >
                <span className="relative z-10">{item.name}</span>
                <div className="absolute inset-0 bg-primary/5 rounded-xl scale-0 group-hover:scale-100 transition-all duration-300 origin-center"></div>
                <div className="absolute bottom-1 left-1/2 w-0 h-1 bg-primary rounded-full group-hover:w-8 transition-all duration-300 transform -translate-x-1/2"></div>
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
              <Input
                type="text"
                placeholder="Search herbs, supplements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-12 pr-4 py-3 bg-muted/20 border-2 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:shadow-lg rounded-full transition-all duration-300"
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md border-border/50">
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
              <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg" asChild>
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            )}
            
            <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 relative hover:scale-110 hover:shadow-lg" asChild>
              <Link to="/cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-12 w-12 text-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 hover:scale-110"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110" />
            <Input
              type="text"
              placeholder="Search herbs, supplements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-12 pr-4 py-3 bg-muted/20 border-2 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:shadow-lg rounded-full transition-all duration-300"
            />
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-border shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-4 text-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-300 group font-semibold"
                style={{ animationDelay: `${index * 100}ms` }}
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
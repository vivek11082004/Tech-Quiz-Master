import React, { useState, useEffect, useRef } from 'react';
import { navbarStyles } from '../assets/dummyStyles.jsx';
import { useNavigate } from 'react-router-dom';
import { UserButton, useUser, SignInButton, useAuth } from '@clerk/clerk-react';
import { List, Home, User, X, Menu } from 'lucide-react';

const Navbar = ({
  logoSrc = null,
  siteName = 'Tech Quiz Master',
  onNavigate = null,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  // To collapse the model on escape key
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Closse when resizing to md+ and lock scroll when open
  useEffect(() => {
    const onResize = () =>
      window.innerWidth >= 768 && setMobileMenuOpen(false);

    window.addEventListener('resize', onResize);

    const prevOverflow = document.body.style.overflow;
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prevOverflow || '';
    };
  }, [mobileMenuOpen]);

  const handleNavigate = (href) => {
    setMobileMenuOpen(false);
    if (onNavigate) return onNavigate(href);

    try {
      navigate(href);
    } catch {
      window.location.href = href;
    }
  };

  // To save token in localStorage for API calls
  const  prevSignedInRef = useRef(isSignedIn);

  useEffect(() => {
    let mounted = true;
    async function saveTokenAndMaybeRedirect() {
      if(!isSignedIn || prevSignedInRef.current === isSignedIn) return;
       try {
        const token = await getToken();
        if (token && mounted) {
          localStorage.setItem('clerkToken', token);
          console.log("Clerk Token saved");
        }
       } catch (error) {
        console.error("Error getting Clerk token:", error);
       }
       const path = window.location.pathname;
       const shouldRedirect = path === '/' || path === '/login' || path === 'signin' || path === '';

       if( shouldRedirect ) {
        if (onNavigate) onNavigate('/dashboard');
       } else {
        try {
          navigate("/dashboard");
        } catch {
          window.location.href = '/dashboard';
        }
       }
       prevSignedInRef.current = isSignedIn;
    }
    saveTokenAndMaybeRedirect();
    return () => { mounted = false; }

  }, [isSignedIn, getToken, navigate, onNavigate]);

  return (
    <nav className={navbarStyles.nav}>
      <div className={navbarStyles.container}>
        <div className="relative h-16 flex items-center justify-between">

          {/* LEFT - LOGO */}
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className={navbarStyles.homeButton}
          >
            <div className={navbarStyles.logoWrapper}>
              <img
                src={
                  logoSrc ||
                  'https://cdn-icons-png.flaticon.com/128/5806/5806364.png'
                }
                alt="logo"
                className={navbarStyles.logoImg}
              />
            </div>

            <div className={navbarStyles.siteNameWrapper}>
              <span className={navbarStyles.siteName}>{siteName}</span>
              <span className={navbarStyles.siteSubtitle}>
                Learning Platform
              </span>
            </div>
          </button>

          {/* CENTER MENU */}
          <div className="hidden md:flex items-center gap-4">

            {/* ONLY WHEN LOGGED IN */}
            {isSignedIn && (
              <>
                <button
                  onClick={() => handleNavigate('/dashboard')}
                  className={navbarStyles.dashboardButton}
                >
                  <Home className={navbarStyles.dashboardIcon} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => handleNavigate('/list')}
                  className={navbarStyles.listButton}
                >
                  <List className={navbarStyles.listIcon} />
                  <span>List Quiz</span>
                </button>
              </>
            )}

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* NOT LOGGED IN → MY PROFILE */}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className={navbarStyles.profileButton}>
                  <User className={navbarStyles.profileIcon} />
                  <span>My Profile</span>
                </button>
              </SignInButton>
            )}

            {/* LOGGED IN → AVATAR */}
            {isSignedIn && (
              <div className={navbarStyles.profileGroup}>
                <div className={navbarStyles.profileBlur} />
                <UserButton
                  appearance={{ elements: { avatarBox: 'w-9 h-9' } }}
                />
              </div>
            )}

            {/* MOBILE MENU */}
            <div className={navbarStyles.mobileMenuContainer}>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((s) => !s)}
                className={navbarStyles.hamburgerButton}
              >
                {mobileMenuOpen ? (
                  <X className={navbarStyles.xIcon} />
                ) : (
                  <Menu className={navbarStyles.menuIcon} />
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className={navbarStyles.mobileOverlay}>
          <div
            onClick={() => setMobileMenuOpen(false)}
            className={navbarStyles.mobileBackdrop}
          />

          <div className={navbarStyles.mobilePanel}>
            <nav className={navbarStyles.mobileNav}>

              {!isSignedIn && (
                <SignInButton mode="modal">
                  <button className={navbarStyles.mobileNavButton}>
                    <User className={navbarStyles.mobileNavIcon} />
                    <div>
                      <div className={navbarStyles.mobileNavItemTitle}>
                        Login
                      </div>
                    </div>
                  </button>
                </SignInButton>
              )}

              {isSignedIn && (
                <>
                  <button
                    onClick={() => handleNavigate('/dashboard')}
                    className={navbarStyles.mobileNavButton}
                  >
                    <Home className={navbarStyles.mobileNavIcon} />
                    <div>
                      <div className={navbarStyles.mobileNavItemTitle}>
                        Dashboard
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavigate('/list')}
                    className={navbarStyles.mobileNavButton}
                  >
                    <List className={navbarStyles.mobileNavIcon} />
                    <div>
                      <div className={navbarStyles.mobileNavItemTitle}>
                        List Quiz
                      </div>
                    </div>
                  </button>
                </>
              )}

            </nav>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
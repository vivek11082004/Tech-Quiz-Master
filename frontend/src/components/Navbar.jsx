import React, { useEffect, useRef, useState } from 'react'
import { backgroundDesigns, svgPatterns, navbarAnimations, navbarStyles } from '../assets/dummyStyles (1).js'
import { useNavigate } from 'react-router-dom';
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/clerk-react';
import { Menu, X } from 'lucide-react';
 
const Navbar = ({ logoSrc, quizType = "default" }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
 
    const navRef = useRef(null);
    const menuBtnRef = useRef(null);
    const menuRef = useRef(null);
 
    const design = backgroundDesigns[quizType] || backgroundDesigns.default;
    const pattern = svgPatterns[design.pattern] || svgPatterns.abstract;
 
    // close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
 
        const handleDocClick = (e) => {
            if (
                navRef.current?.contains(e.target) ||
                menuBtnRef.current?.contains(e.target) ||
                menuRef.current?.contains(e.target)
            ) {
                return;
            }
            setMenuOpen(false);
        };
 
        document.addEventListener("click", handleDocClick, { capture: true });
        return () => document.removeEventListener("click", handleDocClick, { capture: true });
    }, [menuOpen]);
 
    const goTo = (path) => {
        navigate(path);
        setMenuOpen(false);
    };
 
    return (
        <div className={navbarStyles.container}>
            <nav ref={navRef} className={navbarStyles.nav(design.borderColor, isHovering)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}>
                <div className={navbarStyles.patternContainer}>
                    <div className={navbarStyles.patternLayer} style={{ backgroundImage: pattern, ...navbarStyles.backgroundPatternStyle }} />
                </div>
                <div className={navbarStyles.innerContainer}>
                    <div className={navbarStyles.flexContainer}>
 
                        {/* Logo */}
                        <div className={navbarStyles.logoSection}>
                            <button className={navbarStyles.logoButton} onClick={() => goTo('/')}>
                                <img
                                    src={logoSrc || "https://cdn-icons-png.flaticon.com/128/5806/5806364.png"}
                                    alt="logo"
                                    className={navbarStyles.logoImage}
                                />
                            </button>
                        </div>
 
                        {/* Title */}
                        <div className={navbarStyles.titleContainer}>
                            <div className={navbarStyles.titleWrapper}>
                                <div className={navbarStyles.titleBox}>
                                    <h1 className={navbarStyles.titleText(design.textColor)}>
                                        <span className={navbarStyles.titleGradient}>
                                            Tech Quiz Master
                                        </span>
                                    </h1>
                                </div>
                            </div>
                        </div>
 
                        {/* Desktop Buttons */}
                        <div className={navbarStyles.desktopButtons}>
 
                            {/* Logged OUT: My Result + Login */}
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className={navbarStyles.buttonBase(design.accentColor)}>
                                        My Result
                                    </button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <button className={navbarStyles.buttonBase(design.accentColor)}>
                                        Login
                                    </button>
                                </SignInButton>
                            </SignedOut>
 
                            {/* Logged IN: My Result + Admin + Avatar */}
                            <SignedIn>
                                <button
                                    onClick={() => navigate('/result')}
                                    className={navbarStyles.buttonBase(design.accentColor)}
                                >
                                    My Result
                                </button>
 
                                <button
                                    onClick={() => window.location.href = "http://localhost:5174/dashboard"}
                                    className={navbarStyles.buttonBase(design.accentColor)}
                                >
                                    Admin
                                </button>
 
                                <div className="flex items-center justify-center ml-3">
                                    <UserButton appearance={{
                                        elements: {
                                            avatarBox: "w-10 h-10 rounded-full border-2 border-gray-300",
                                            userButton: "p-2 rounded-md hover:bg-gray-100",
                                            userButtonText: "text-sm text-gray-700",
                                            userButtonIcon: "hidden"
                                        }
                                    }} />
                                </div>
                            </SignedIn>
                        </div>
 
                        {/* Mobile Hamburger Button */}
                        <button
                            ref={menuBtnRef}
                            className={`lg:hidden ${navbarStyles.mobileMenuButton(design.accentColor)}`}
                            onClick={() => setMenuOpen((s) => !s)}
                        >
                            {menuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
 
                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div ref={menuRef} className={navbarStyles.mobileMenuWrapper}>
 
                            {/* Logged OUT */}
                            <SignedOut>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <SignInButton mode="modal">
                                        <button className={navbarStyles.buttonBase(design.accentColor)}>
                                            My Results
                                        </button>
                                    </SignInButton>
                                    <SignInButton mode="modal">
                                        <button className={navbarStyles.buttonBase(design.accentColor)}>
                                            Login
                                        </button>
                                    </SignInButton>
                                </div>
                            </SignedOut>
 
                            {/* Logged IN */}
                            <SignedIn>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => { navigate('/result'); setMenuOpen(false); }}
                                        className={navbarStyles.buttonBase(design.accentColor)}
                                    >
                                        My Results
                                    </button>
 
                                    <button
                                        onClick={() => { window.location.href = "http://localhost:5174/dashboard"; setMenuOpen(false); }}
                                        className={navbarStyles.buttonBase(design.accentColor)}
                                    >
                                        Admin
                                    </button>
 
                                    <UserButton />
                                </div>
                            </SignedIn>
                        </div>
                    )}
                </div>
            </nav>
            <style>{navbarAnimations}</style>
        </div>
    )
}
 
export default Navbar
 
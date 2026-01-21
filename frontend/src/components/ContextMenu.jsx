import React, { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export function ContextMenu({ x, y, items, onClose }) {
  const menuRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Adjust position if menu goes off screen
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      if (adjustedX < 10) adjustedX = 10;
      if (adjustedY < 10) adjustedY = 10;

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y }}
    >
      {items.map((item, idx) => {
        if (item.type === "separator") {
          return (
            <div
              key={idx}
              className="h-px bg-[#3c3c3c] my-1 mx-2"
            />
          );
        }

        if (item.type === "label") {
          return (
            <div
              key={idx}
              className="px-3 py-1.5 text-[11px] text-[#858585] font-medium uppercase tracking-wider"
            >
              {item.label}
            </div>
          );
        }

        return (
          <button
            key={idx}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2 text-sm text-left transition-colors",
              item.disabled
                ? "text-[#6a6a6a] cursor-not-allowed"
                : item.danger
                ? "text-[#f44747] hover:bg-[#f44747]/10"
                : "text-[#cccccc] hover:bg-[#094771]"
            )}
            onClick={() => {
              if (!item.disabled) {
                item.onClick?.();
                onClose();
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className="w-4 h-4 flex items-center justify-center text-base">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-[11px] text-[#858585] ml-4">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Hook to use context menu
export function useContextMenu() {
  const [contextMenu, setContextMenu] = React.useState(null);

  const openContextMenu = useCallback((e, items) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const ContextMenuComponent = contextMenu ? (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      items={contextMenu.items}
      onClose={closeContextMenu}
    />
  ) : null;

  return {
    openContextMenu,
    closeContextMenu,
    ContextMenuComponent,
  };
}

export default ContextMenu;

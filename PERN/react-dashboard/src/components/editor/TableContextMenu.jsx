import { useEffect } from "react";

export const TableContextMenu = ({ editor }) => {
  useEffect(() => {
    const handleContextMenu = (event) => {
      const target = event.target;
      const isInTable = target.closest('table');
      
      if (isInTable && editor) {
        event.preventDefault();
        
        // Get table position
        const rect = isInTable.getBoundingClientRect();
        
        // Show custom context menu
        const menu = document.createElement('div');
        menu.className = 'fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 p-2 min-w-[180px]';
        menu.style.top = `${event.clientY}px`;
        menu.style.left = `${event.clientX}px`;
        
        menu.innerHTML = `
          <div class="context-menu-item" data-action="add-row-before">➕ Add Row Above</div>
          <div class="context-menu-item" data-action="add-row-after">➕ Add Row Below</div>
          <div class="context-menu-item" data-action="add-col-before">➕ Add Column Left</div>
          <div class="context-menu-item" data-action="add-col-after">➕ Add Column Right</div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item" data-action="delete-row">🗑️ Delete Row</div>
          <div class="context-menu-item" data-action="delete-col">🗑️ Delete Column</div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item" data-action="delete-table">❌ Delete Table</div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          .context-menu-item {
            padding: 8px 12px;
            cursor: pointer;
            transition: background 0.2s;
          }
          .context-menu-item:hover {
            background: #f3f4f6;
          }
          .dark .context-menu-item:hover {
            background: #374151;
          }
          .context-menu-divider {
            height: 1px;
            background: #e5e7eb;
            margin: 4px 0;
          }
          .dark .context-menu-divider {
            background: #374151;
          }
        `;
        document.head.appendChild(style);
        
        const handleAction = (action) => {
          switch(action) {
            case 'add-row-before':
              editor.chain().focus().addRowBefore().run();
              break;
            case 'add-row-after':
              editor.chain().focus().addRowAfter().run();
              break;
            case 'add-col-before':
              editor.chain().focus().addColumnBefore().run();
              break;
            case 'add-col-after':
              editor.chain().focus().addColumnAfter().run();
              break;
            case 'delete-row':
              editor.chain().focus().deleteRow().run();
              break;
            case 'delete-col':
              editor.chain().focus().deleteColumn().run();
              break;
            case 'delete-table':
              editor.chain().focus().deleteTable().run();
              break;
          }
          document.body.removeChild(menu);
          document.removeEventListener('click', removeMenu);
        };
        
        const removeMenu = (e) => {
          if (!menu.contains(e.target)) {
            if (document.body.contains(menu)) {
              document.body.removeChild(menu);
            }
            document.removeEventListener('click', removeMenu);
          }
        };
        
        menu.querySelectorAll('.context-menu-item').forEach(item => {
          item.addEventListener('click', () => handleAction(item.dataset.action));
        });
        
        document.body.appendChild(menu);
        setTimeout(() => document.addEventListener('click', removeMenu), 0);
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [editor]);
  
  return null;
};
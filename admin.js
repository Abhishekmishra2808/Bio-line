document.addEventListener('DOMContentLoaded', () => {

    // --- Mock Data ---
    const MOCK_USERS = [
        { email: 'user1@cmlre.gov', role: 'Researcher', lastLogin: '2h ago', analyses: 128, status: 'Active' },
        { email: 'user2@cmlre.gov', role: 'Admin', lastLogin: '1d ago', analyses: 42, status: 'Active' },
        { email: 'user3@cmlre.gov', role: 'Researcher', lastLogin: '5d ago', analyses: 7, status: 'Suspended' },
        { email: 'user4@partner.org', role: 'Collaborator', lastLogin: '3h ago', analyses: 215, status: 'Active' },
        { email: 'user5@cmlre.gov', role: 'Researcher', lastLogin: '1m ago', analyses: 1, status: 'Pending' },
        { email: 'user6@new.net', role: 'Collaborator', lastLogin: '5m ago', analyses: 0, status: 'Pending' }
    ];

    // --- Element References ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const approvalListContainer = document.getElementById('approval-list');
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search');
    const selectAllUsersCheckbox = document.getElementById('select-all-users');
    const modal = document.getElementById('confirmation-modal');
    const modalText = document.getElementById('modal-text');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const logoutBtn = document.getElementById('logout-btn');
    const exportUsersBtn = document.getElementById('export-users-btn');
    const promoteModelBtn = document.getElementById('promote-model-btn');
    const notificationsBtn = document.getElementById('notifications-btn');
    const profileBtn = document.getElementById('profile-btn');
    const sidebarNav = document.getElementById('sidebar-nav');
    const breadcrumbActive = document.getElementById('breadcrumb-active');
    const dashboardView = document.getElementById('dashboard-view');
    const settingsView = document.getElementById('settings-view');
    const mainContent = document.getElementById('main-content');

    // System Settings buttons
    const changePasswordBtn = document.getElementById('change-password-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    let onConfirmCallback = null;

    // --- Modal Logic ---
    const showModal = (text, onConfirm) => {
        modalText.textContent = text;
        onConfirmCallback = onConfirm;
        modal.classList.remove('hidden');
    };

    const hideModal = () => {
        modal.classList.add('hidden');
        onConfirmCallback = null;
    };
    
    modalConfirm.addEventListener('click', () => {
        if (onConfirmCallback) {
            onConfirmCallback();
        }
        hideModal();
    });
    modalCancel.addEventListener('click', hideModal);

    // --- Header Button Functionality ---
    logoutBtn.addEventListener('click', () => {
        showModal('Are you sure you want to log out?', () => {
            console.log('Logging out...');
            window.location.href = './index.html';
        });
    });
    
    notificationsBtn.addEventListener('click', () => alert('Notifications:\n- New user registered\n- Analysis batch #123 complete'));
    profileBtn.addEventListener('click', () => alert('Admin Profile:\n- View Profile\n- Settings\n- API Keys'));

    // --- Sidebar Navigation ---
    sidebarNav.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link) return;

        const targetId = link.getAttribute('href');

        // Update active styles
        sidebarNav.querySelectorAll('a').forEach(l => {
            l.classList.remove('text-white', 'bg-gray-800');
            l.classList.add('text-gray-400');
        });
        link.classList.add('text-white', 'bg-gray-800');
        link.classList.remove('text-gray-400');
        
        // Update breadcrumb
        breadcrumbActive.textContent = link.querySelector('span').textContent;

        // View/Section Switching
        if (targetId === '#settings') {
            dashboardView.classList.add('hidden');
            settingsView.classList.remove('hidden');
            // Animate the settings view in
            setTimeout(() => settingsView.querySelector('.reveal')?.classList.add('visible'), 50);

        } else {
            dashboardView.classList.remove('hidden');
            settingsView.classList.add('hidden');
            const targetSection = document.getElementById(targetId.substring(1) + '-section');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        // Close sidebar on mobile after clicking a link
        if (window.innerWidth < 768) {
            sidebar.classList.add('-translate-x-full');
        }
    });


    // --- Sidebar Toggle for Mobile ---
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
    });
    
    // --- Skeleton Loading Simulation ---
    const showSkeletons = (show) => {
        const skeletons = ['api-status', 'active-users', 'queue', 'accuracy'];
        skeletons.forEach(id => {
            document.getElementById(`${id}-skeleton`).style.display = show ? 'block' : 'none';
            document.getElementById(`${id}-content`).style.display = show ? 'none' : 'block';
        });
    };

    // --- User Table & Approval Logic ---
    const renderApprovalList = () => {
        const pendingUsers = MOCK_USERS.filter(user => user.status === 'Pending');
        if (pendingUsers.length === 0) {
            approvalListContainer.innerHTML = `<p class="text-sm text-gray-500">No new registrations requiring approval.</p>`;
            return;
        }
        approvalListContainer.innerHTML = pendingUsers.map(user => `
            <div class="flex items-center justify-between bg-gray-800/50 p-3 rounded-md">
                <div>
                    <p class="text-sm font-medium">${user.email}</p>
                    <p class="text-xs text-gray-400">Role: ${user.role}</p>
                </div>
                <div class="flex space-x-2">
                    <button data-action="approve" data-email="${user.email}" class="btn-primary text-xs px-3 py-1 !border-green-500 !text-green-400 hover:!bg-green-500 hover:!text-black">Approve</button>
                    <button data-action="deny" data-email="${user.email}" class="btn-secondary text-xs px-3 py-1 !border-red-500 !text-red-400 hover:!bg-red-500 hover:!text-white">Deny</button>
                </div>
            </div>
        `).join('');
    };
    
    const renderUserTable = (users) => {
        const approvedUsers = users.filter(user => user.status !== 'Pending');
        userTableBody.innerHTML = approvedUsers.map(user => `
            <tr class="border-b border-gray-800 hover:bg-gray-800/50">
                <td class="py-3 px-2"><input type="checkbox" class="user-checkbox bg-black border-gray-600"></td>
                <td class="py-3">${user.email}</td>
                <td class="py-3 text-gray-400">${user.role}</td>
                <td class="py-3 text-gray-400">${user.lastLogin}</td>
                <td class="py-3 text-right text-gray-400">${user.analyses}</td>
                <td class="py-3 text-center">
                    <span class="px-2 py-1 text-xs rounded-full ${
                        user.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'Suspended' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }">${user.status}</span>
                </td>
            </tr>
        `).join('');
    };

    approvalListContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;
        const email = button.dataset.email;
        const userIndex = MOCK_USERS.findIndex(user => user.email === email);

        if (userIndex === -1) return;

        if (action === 'approve') {
            MOCK_USERS[userIndex].status = 'Active';
        } else if (action === 'deny') {
            MOCK_USERS.splice(userIndex, 1);
        }

        renderApprovalList();
        renderUserTable(MOCK_USERS);
    });

    userSearchInput.addEventListener('keyup', () => {
        const searchTerm = userSearchInput.value.toLowerCase();
        const filteredUsers = MOCK_USERS.filter(user => user.email.toLowerCase().includes(searchTerm));
        renderUserTable(filteredUsers);
    });

    selectAllUsersCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        userTableBody.querySelectorAll('.user-checkbox').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });
    
    userTableBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('user-checkbox')) {
            const allCheckboxes = userTableBody.querySelectorAll('.user-checkbox');
            const allChecked = Array.from(allCheckboxes).every(checkbox => checkbox.checked);
            selectAllUsersCheckbox.checked = allChecked;
        }
    });
    
    exportUsersBtn.addEventListener('click', () => {
        showModal('Export all users to CSV?', () => {
            const headers = Object.keys(MOCK_USERS[0]).join(',');
            const csv = MOCK_USERS.map(row => Object.values(row).join(',')).join('\n');
            const csvContent = `${headers}\n${csv}`;
            console.log("--- EXPORTING CSV DATA ---");
            console.log(csvContent);
            alert('User data exported to browser console.');
        });
    });
    
    // --- Model Performance ---
    promoteModelBtn.addEventListener('click', () => {
        showModal('Are you sure you want to promote model v3.0 to production?', () => {
            console.log('Promoting model v3.0...');
            promoteModelBtn.textContent = 'PROMOTED';
            promoteModelBtn.disabled = true;
            alert('Model v3.0 has been promoted.');
        });
    });

    // --- System Settings Functionality ---
    changePasswordBtn.addEventListener('click', () => {
        alert('Password change screen would appear here.');
    });

    deleteAccountBtn.addEventListener('click', () => {
        showModal('This action is irreversible and will delete all associated data. Are you sure?', () => {
            console.log('Deleting account...');
            alert('Account has been deleted (simulated).');
        });
    });

    // --- Chart.js Setup ---
    Chart.defaults.font.family = "'Roboto Mono', monospace";
    Chart.defaults.color = '#9ca3af';

    const createChartConfig = (type, data, options) => ({
        type,
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    titleFont: { family: "'Roboto Mono', monospace" },
                    bodyFont: { family: "'Roboto Mono', monospace" },
                    padding: 12,
                    cornerRadius: 4,
                    borderColor: '#3f3f46',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y;
                                if (context.chart.canvas.id === 'accuracyTrendChart') {
                                     label += '%';
                                }
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: '#27272a' }, ticks: { font: { size: 10 } } },
                x: { grid: { color: '#27272a' }, ticks: { font: { size: 10 } } }
            },
            ...options
        }
    });

    // Analysis Volume Chart
    const analysisVolumeChart = new Chart(document.getElementById('analysisVolumeChart'), createChartConfig('line', {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Analyses',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: true,
            borderColor: '#ffffff',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                return gradient;
            },
            tension: 0.4,
            pointBackgroundColor: '#000',
            pointBorderColor: '#fff',
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    }, { plugins: { legend: { display: true, labels: { boxWidth: 10, font: { size: 10 } } } } }));

    // Accuracy Trend Chart
    const accuracyTrendChart = new Chart(document.getElementById('accuracyTrendChart'), createChartConfig('line', {
        labels: [['v1.0', '(9 Taxa)'], ['v2.0', '(16 Taxa)'], ['v3.0', '(35 Taxa)']],
        datasets: [{ 
            data: [86.4, 90.7, 93.8], 
            borderColor: '#34d399', 
            tension: 0.4,
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                gradient.addColorStop(0, 'rgba(52, 211, 153, 0.3)');
                gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');
                return gradient;
            },
            pointBackgroundColor: '#000',
            pointBorderColor: '#34d399',
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBorderWidth: 2,
        }]
    }, { scales: { y: { min: 85, max: 95 } } }));

    // Confidence Distribution Chart
    const confidenceDistChart = new Chart(document.getElementById('confidenceDistChart'), createChartConfig('bar', {
        labels: ['<90%', '90-95%', '95-98%', '>98%'],
        datasets: [{ 
            data: [12, 19, 52, 128], 
            backgroundColor: 'rgba(96, 165, 250, 0.8)',
            hoverBackgroundColor: 'rgba(147, 197, 253, 1)',
            borderRadius: 4,
        }]
    }));


    // --- WebSocket Simulation for real-time updates ---
    setInterval(() => {
        // Update overview cards
        document.querySelector('#api-status-content p').textContent = `${Math.floor(Math.random() * 5) + 10}ms`;
        const currentUserCount = parseInt(document.querySelector('#active-users-content p').textContent.replace(',', ''));
        document.querySelector('#active-users-content p').textContent = (currentUserCount + Math.floor(Math.random() * 5 - 2)).toLocaleString();
        document.querySelector('#queue-content p').textContent = Math.floor(Math.random() * 10) + 80;

        // Update analysis chart
        if(analysisVolumeChart.data.datasets[0].data.length > 20) {
             analysisVolumeChart.data.datasets[0].data.shift();
             analysisVolumeChart.data.labels.shift();
        }
        analysisVolumeChart.data.datasets[0].data.push(Math.floor(Math.random() * 50) + 40);
        analysisVolumeChart.update('none');

    }, 2500);
    
    // --- Initial Load ---
    const initialLoad = () => {
        showSkeletons(true);
        setTimeout(() => {
            renderApprovalList();
            renderUserTable(MOCK_USERS);
            showSkeletons(false);
            document.querySelectorAll('#dashboard-view .reveal').forEach(el => {
                el.classList.add('visible');
            });
        }, 1500);
    };

    initialLoad();

});

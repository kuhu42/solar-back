// import React from 'react';
// //import { useApp } from './context/AppContext.jsx';
// import { useApp } from '../src/hooks/useApp.js'
// import { USER_ROLES, USER_STATUS } from './types/index.js';
// import LoginScreen from './components/Auth/LoginScreen.jsx';
// import PendingApproval from './components/Auth/PendingApproval.jsx';
// import AppLayout from './components/Layout/AppLayout.jsx';
// import CompanyDashboard from './components/Dashboard/CompanyDashboard.jsx';
// import AgentDashboard from './components/Dashboard/AgentDashboard.jsx';
// import FreelancerDashboard from './components/Dashboard/FreelancerDashboard.jsx';
// import InstallerDashboard from './components/Dashboard/InstallerDashboard.jsx';
// import TechnicianDashboard from './components/Dashboard/TechnicianDashboard.jsx';
// import CustomerDashboard from './components/Dashboard/CustomerDashboard.jsx';

// function App() {
//   const { currentUser } = useApp();

//   // Show login screen if no user is logged in
//   if (!currentUser) {
//     return <LoginScreen />;
//   }

//   // Show pending approval screen for users awaiting approval
//   if (currentUser.status === USER_STATUS.PENDING) {
//     return <PendingApproval user={currentUser} />;
//   }

//   // Render appropriate dashboard based on user role
//   const renderDashboard = () => {
//     switch (currentUser.role) {
//       case USER_ROLES.COMPANY:
//         return <CompanyDashboard />;
//       case USER_ROLES.AGENT:
//         return <AgentDashboard />;
//       case USER_ROLES.FREELANCER:
//         return <FreelancerDashboard />;
//       case USER_ROLES.INSTALLER:
//         return <InstallerDashboard />;
//       case USER_ROLES.TECHNICIAN:
//         return <TechnicianDashboard />;
//       case USER_ROLES.CUSTOMER:
//         return <CustomerDashboard />;
//       default:
//         return <div>Invalid user role</div>;
//     }
//   };

//   return (
//     <AppLayout>
//       {renderDashboard()}
//     </AppLayout>
//   );
// }

// export default App;


import React from 'react';
import { useApp } from '../src/hooks/useApp.js'
import { LanguageProvider, useLanguage } from '../src/context/LanguageContext.js'; // ✅ Add this import

import { USER_ROLES, USER_STATUS } from './types/index.js';
import LoginScreen from './components/Auth/LoginScreen.jsx';
import PendingApproval from './components/Auth/PendingApproval.jsx';
import AppLayout from './components/Layout/AppLayout.jsx';
import CompanyDashboard from './components/Dashboard/CompanyDashboard.jsx';
import AgentDashboard from './components/Dashboard/AgentDashboard.jsx';
import FreelancerDashboard from './components/Dashboard/FreelancerDashboard.jsx';
import InstallerDashboard from './components/Dashboard/InstallerDashboard.jsx';
import TechnicianDashboard from './components/Dashboard/TechnicianDashboard.jsx';
import CustomerDashboard from './components/Dashboard/CustomerDashboard.jsx';

function App() {
  const { currentUser } = useApp();

  // Show login screen if no user is logged in
  if (!currentUser) {
    return (
      <LanguageProvider> {/* ✅ Wrap login screen too */}
        <LoginScreen />
      </LanguageProvider>
    );
  }

  // Show pending approval screen for users awaiting approval
  if (currentUser.status === USER_STATUS.PENDING) {
    return (
      <LanguageProvider> {/* ✅ Wrap pending approval too */}
        <PendingApproval user={currentUser} />
      </LanguageProvider>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case USER_ROLES.COMPANY:
        return <CompanyDashboard />;
      case USER_ROLES.AGENT:
        return <AgentDashboard />;
      case USER_ROLES.FREELANCER:
        return <FreelancerDashboard />;
      case USER_ROLES.INSTALLER:
        return <InstallerDashboard />;
      case USER_ROLES.TECHNICIAN:
        return <TechnicianDashboard />;
      case USER_ROLES.CUSTOMER:
        return <CustomerDashboard />;
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <LanguageProvider> {/* ✅ Wrap everything with LanguageProvider */}
      <AppLayout>
        {renderDashboard()}
      </AppLayout>
    </LanguageProvider>
  );
}

export default App;

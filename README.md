# Invenia+ Inventory Management System

Invenia+ is a robust inventory management system built using Angular, Tailwind CSS, Django, and PostgreSQL. It leverages Azure Static for frontend hosting and Azure App Service for backend deployment, ensuring scalability and reliability.

## Features
- **Inventory Management:** Track and manage your inventory efficiently.
- **Guest Mode:** Access the system as a guest user with limited functionalities using SQLite.
- **Admin Privileges:** Admin developers can create authenticated and authorized users for full access.
- **API-Based Notifications:** Notifications currently rely on API; however, WebSocket integration is planned for the near future.
- **Point of Sale (POS):** Integration for online payment functionality for POS is a future enhancement.

## Deployment
- **Frontend:** Hosted on Azure Static.
- **Backend:** Deployed on Azure App Service. Please note that the actual backend source code for authenticated and authorized users is deployed in a separate Git repository. The backend code available in this repository is for Guest Mode only. During deployment, you may encounter errors due to the deployment of both frontend and backend code together, but the actual backend code is fully functional.

## Future Plans
- **WebSocket Integration:** Notifications will transition to WebSocket for real-time updates.
- **Online Payment Integration:** Incorporate online payment functionality for the Point of Sale feature.
- **Public User Registration:** Implement registration for public users to access the system with full privileges.

## Getting Started
1. Clone the repository.
2. Set up Angular, Tailwind CSS, Django, and PostgreSQL.
3. Configure Azure Static and Azure App Service for deployment.
4. Customize the application to suit your specific needs.

## Contributors
- Daryl Andres

Feel free to reach out for any inquiries or contributions!
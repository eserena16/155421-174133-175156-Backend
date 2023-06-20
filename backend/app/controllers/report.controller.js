const db = require("../models");
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { purchase: Purchase, sale: Sale, user: User } = db;
const config = require("../config/subscription.config");
const sendNotification  = require("../utils/sendNotification");

const Op = db.Sequelize.Op;
var { catchErrorAuth } = require("../utils/loggerFunctions");
var { logger } = require("../utils/logger");
exports.send = async (req, res) => {
  try {
    const countSales = await Sale.scope({
        method: ["byCompany", req.companyId],
      }).count();
    const countPurchases = await Purchase.scope({
        method: ["byCompany", req.companyId],
      }).count();
    
    const mailUser = await User.findByPk(req.userId, {
    attributes: ['email']});

    console.log("mailUser: " + JSON.stringify(mailUser));
    console.log("mailUser.email: " + JSON.parse(JSON.stringify(mailUser)).email);

    if(countSales === 0 && countPurchases === 0 ){
      res.status(200).send({
        message: `No sales and purchase were found.`,
      });
    }else {    
        if(mailUser && JSON.stringify(mailUser) && JSON.parse(JSON.stringify(mailUser)).email){   
            const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 400, height: 400 });        
            const configuracionGrafica = {
                type: 'bar',
                data: {
                labels: ['Ventas', 'Compras'],
                    datasets: [{
                        data: [countPurchases, countSales], // Datos de ejemplo
                        backgroundColor: ['blue', 'green'],                    
                        borderWidth: 1,                    
                    }],
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    plugins: {
                    datalabels: {
                        formatter: (value) => `${value}`,
                        color: '#000',
                        font: {
                        weight: 'bold',
                        },
                    },
                    },
                    scales: {
                    x: {
                        grid: {
                        display: false,
                        },
                    },
                    y: {
                        grid: {
                        color: '#ddd',
                        },
                    },
                    },   
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },            
                },
            };        
            const imagenBuffer = await chartJSNodeCanvas.renderToBuffer(configuracionGrafica);
            
            const imagenBase64 = imagenBuffer.toString('base64');
    
            const html = `
            <html>
                <body>
                <p>Hola,</p>
                <p>Se envía adjunta la gráfica con el reporte de la empresa respecto a compras y ventas.</p>
                <p>Gracias,</p>
                <p>El equipo de nuestra aplicación</p>
                </body>
            </html>
            `;

            const message = {
                from: config.from,
                to: JSON.parse(JSON.stringify(mailUser)).email,
                html: html,
                subject: "Envío de reporte de empresa",
                attachments: [
                    {
                    filename: 'grafica.png',
                    content: imagenBase64,
                    contentType: 'image/png',
                    },
                ],
            };              
            sendNotification.sendMessage(req, config.hostMQ, config.exchangeMQ, "REPORT", message);
            res.status(200).send({
                message: `Report generated successfully.`,
            });
        }else{
            res.status(400).send({
                message: `Report not generated. Mail not valid.`,
            });
        }
    }
  } catch (error) {
    return catchErrorAuth(
      "dashboard",
      "An error occurred during fetching sales.",
      error,
      req,
      res
    );
  }
};

// Replace these methods with authenticated backend calls before enabling real services.
// Local methods never pretend to send alerts, request callbacks, or dispatch help.
export const services = {
 async requestCallback(){return {state:'not_connected',reason:'Callback service is not connected.'};},
 async alertContacts(){return {state:'not_connected',reason:'No automatic alert service is connected.'};},
 async submitReachMe(){return {state:'not_connected',verified:false,reason:'No emergency-provider network is connected.'};},
 subscribeProvider(incidentId,onUpdate){void incidentId;void onUpdate;return ()=>{};},
 async sendUpdate(incident,update){void incident;return {...update,delivery:'local_only'};},
 async endIncident(){return {state:'ended_locally'};}
};

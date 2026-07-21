// Data store for mock vehicle database (1,000 inventory items)
const makes = ["Honda", "Toyota", "Ford", "Jeep", "Chevrolet", "Nissan", "Kia", "Subaru"];
const models = {
    Honda: ["Civic", "Accord", "CR-V", "Pilot", "Ridgeline"], 
    Toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Tundra"],
    Ford: ["F-150", "Explorer", "Escape", "Mustang", "Bronco"], 
    Jeep: ["Wrangler", "Grand Cherokee", "Compass", "Gladiator"],
    Chevrolet: ["Silverado", "Tahoe", "Equinox", "Camaro"], 
    Nissan: ["Altima", "Rogue", "Sentra", "Frontier"],
    Kia: ["Telluride", "Sorento", "Sportage", "Soul"], 
    Subaru: ["Outback", "Crosstrek", "Forester", "WRX"]
};
const types = { 
    Civic: "Sedan", Accord: "Sedan", "CR-V": "SUV", Pilot: "SUV", Ridgeline: "Truck", 
    Camry: "Sedan", Corolla: "Sedan", RAV4: "SUV", Highlander: "SUV", Tundra: "Truck", 
    "F-150": "Truck", Explorer: "SUV", Escape: "SUV", Mustang: "Coupe", Bronco: "SUV", 
    Wrangler: "SUV", "Grand Cherokee": "SUV", Compass: "SUV", Gladiator: "Truck", 
    Silverado: "Truck", Tahoe: "SUV", Equinox: "SUV", Camaro: "Coupe", 
    Altima: "Sedan", Rogue: "SUV", Sentra: "Sedan", Frontier: "Truck", 
    Telluride: "SUV", Sorento: "SUV", Sportage: "SUV", Soul: "SUV", 
    Outback: "SUV", Crosstrek: "SUV", Forester: "SUV", WRX: "Sedan" 
};
const colors = [
    { name: "Rallye Red", class: "text-rose-600" }, 
    { name: "Crystal Black", class: "text-slate-800" }, 
    { name: "Bright White", class: "text-slate-400" }, 
    { name: "Sonic Gray", class: "text-teal-600" }, 
    { name: "Cavalry Blue", class: "text-blue-600" }
];

const allVehicles = Array.from({ length: 1000 }, (_, i) => {
    const make = makes[i % makes.length];
    const modelList = models[make];
    const model = modelList[i % modelList.length];
    const price = 19000 + ((i * 797) % 48000);
    return {
        id: i + 1,
        year: 2021 + (i % 5),
        make: make,
        model: model,
        type: types[model] || "SUV",
        price: price,
        payment: Math.round(price / 68),
        miles: (1200 + ((i * 1432) % 72000)).toLocaleString(),
        color: colors[i % colors.length].name,
        colorClass: colors[i % colors.length].class,
        img: "carsalesimage.JPG"
    };
});

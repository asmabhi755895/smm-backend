
import { services } from "./services";

const packageOptions = [
  { suffix: "01", quality: "Standard", delivery: "Gradual Delivery", refill: "No Refill", multiplier: 1 },
  { suffix: "02", quality: "Premium", delivery: "Fast Delivery", refill: "30 Days Refill", multiplier: 1.5 },
  { suffix: "03", quality: "Premium", delivery: "Fast Delivery", refill: "90 Days Refill", multiplier: 2 },
];

const generatedPackages = services
  .filter((service) => service.id !== 4)
  .flatMap((service) =>
    packageOptions.map((option, index) => ({
      id: `${service.id}0${index + 1}`,
      serviceId: service.id,
      name: `${service.name} - ${option.quality}`,
      quality: option.quality,
      delivery: option.delivery,
      refill: option.refill,
      pricePer1000: Math.round(
        service.pricePer1000 * option.multiplier * 100
      ) / 100,
      min: service.min,
      max: service.max,
      description: `${option.quality} package. Sample pricing for development.`,
    }))
  );

const followerPackages = [
  {
    id: "6106",
    serviceId: 4,
    name: "Instagram Indian Followers - Standard",
    quality: "Standard",
    delivery: "Gradual Delivery",
    refill: "No Refill",
    pricePer1000: 251.54,
    min: 100,
    max: 100000,
    description: "Sample catalogue entry. Verify supplier details.",
  },
  {
    id: "6107",
    serviceId: 4,
    name: "Instagram Indian Followers - Premium",
    quality: "Premium",
    delivery: "Fast Delivery",
    refill: "30 Days Refill",
    pricePer1000: 276.01,
    min: 100,
    max: 100000,
    description: "Sample catalogue entry. Verify supplier details.",
  },
  {
    id: "6141",
    serviceId: 4,
    name: "Instagram Indian Followers - 90 Day Refill",
    quality: "Premium",
    delivery: "Fast Delivery",
    refill: "90 Days Refill",
    pricePer1000: 326.83,
    min: 100,
    max: 100000,
    description: "Sample catalogue entry. Verify supplier details.",
  },
  {
    id: "6142",
    serviceId: 4,
    name: "Instagram Indian Followers - 365 Day Refill",
    quality: "Premium",
    delivery: "Fast Delivery",
    refill: "365 Days Refill",
    pricePer1000: 348.94,
    min: 100,
    max: 100000,
    description: "Sample catalogue entry. Verify supplier details.",
  },
  {
    id: "6143",
    serviceId: 4,
    name: "Instagram Indian Followers - Lifetime Refill",
    quality: "Premium",
    delivery: "Fast Delivery",
    refill: "Lifetime Refill",
    pricePer1000: 374.53,
    min: 100,
    max: 100000,
    description: "Sample catalogue entry. Verify supplier details.",
  },
];

export const packages = [
  ...generatedPackages,
  ...followerPackages,
];

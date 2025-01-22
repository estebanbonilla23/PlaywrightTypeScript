import { test, expect } from '@playwright/test';

test('Dismiss Suggested Survey', async ({ page }) => {
  
  await page.goto('https://www.huevosbuenos.com/home');

  // Expect a title "to contain" a substring
  await expect(page).toHaveTitle(/Organic Grocery Delivery/);

  // Expect the take a quiz modal
  await expect(page.locator('.take-quiz-button')).toBeVisible();

  // Click the dismiss button
  await page.locator('.dismiss-button').click();
  await expect(page.locator('.dismiss-button')).toBeHidden();

  // Click to start shopping
  await page.getByRole('link', { name: 'Start shopping.' }).click();

  // Expect the new title
  await expect(page).toHaveTitle(/Fresh Picks/);
});

test('Add products to the basket', async ({ page }) => {
  
  await page.goto('https://www.huevosbuenos.com/home');

  // Expect a title "to contain" a substring
  await expect(page).toHaveTitle(/Organic Grocery Delivery/);

  // Click to fresh picks
  await page.getByRole('link', { name: 'Fresh Picks' }).first().click();

  // Wait for the product tiles to load and be visible
  await page.waitForSelector('[data-testid="product-tile"]', { state: 'visible' });

  // Get all products
  const products = await page.locator('[data-testid="product-tile"]');

  // Get the total number of products found
  const productCount = await products.count();
  console.log(`Total number of products found: ${productCount}`);

  // Define the type for the product data object
  type Product = {
    name: string;
    priceDollar: number;
    priceCent: number;
  };

  // Initialize the array with the correct type
  const productList: Product[] = [];

  // Loop through each product and extract its name and price
  for (let i = 0; i < productCount; i++) {
    const product = products.nth(i); // Get the i-th product tile

    // Extract the product name
    const productName = await product.locator('.product-tile__product-name').first().innerText();
    expect(productName).not.toBe(''); // Validating that the product name is not empty
    
    // Extract the product price
    const productDollar = await product.locator('#price-dollars').innerText();
    const productCent = await product.locator('#price-cents').innerText();
    
    // Ensure the dollar and cent parts are valid numbers
    const dollarValue = parseInt(productDollar, 10);
    const centValue = productCent ? parseInt(productCent, 10) : 0;

    // Check if the values are numbers and not NaN
    expect(dollarValue).not.toBeNaN();
    expect(centValue).toBeGreaterThanOrEqual(0);
    expect(centValue).toBeLessThanOrEqual(99); // Cent should be between 0 and 99

    // Add the product name and price to the list
    productList.push({ name: productName, priceDollar: dollarValue, priceCent: centValue });
  }

  // Log the product list to the console
  console.log('Product List:', productList);

  //Ensure that the product list is not empty
  expect(productList).not.toHaveLength(0);

  // Validate the number of products
  expect(productCount).toBeGreaterThanOrEqual(5);

  // Click on the first product to add to the cart and validate the action
  const firstProduct = products.nth(0);
  await firstProduct.locator('[data-testid="product-tile-quick-add"]').click();

  // Wait for the remove button
  await page.waitForSelector('.product-tile__quick-add-button-remove', { state: 'visible' });

  // Validate that the cart item count has increased
  await page.waitForSelector('.basket-button__item-count', { state: 'visible' });

  // Validate the basket has 1 product
  const element = await page.locator('.basket-button__item-count').first();
  await expect(element).toHaveText('1');
});

// Add a new namespace here, then create a matching JSON file in
// `messages/<locale>/<namespace>.json` for every locale.
export const namespaces = ["common", "home", "footer", "reviews", "about", "locations", "shop", "cart", "contact"] as const;

export type Namespace = (typeof namespaces)[number];

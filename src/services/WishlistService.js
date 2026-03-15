import User from '../models/User.js';

class WishlistService {
    async getWishlist(context) {
        if (!context.user) throw new Error('Unauthorized');
        const user = await User.findById(context.user.id).populate('wishlist');
        return user.wishlist || [];
    }

    async toggleWishlist(productId, context) {
        if (!context.user) throw new Error('Unauthorized');
        
        const user = await User.findById(context.user.id);
        const index = user.wishlist.indexOf(productId);
        
        if (index === -1) {
            user.wishlist.push(productId);
        } else {
            user.wishlist.splice(index, 1);
        }
        
        await user.save();
        return user.wishlist;
    }
}

export default new WishlistService();

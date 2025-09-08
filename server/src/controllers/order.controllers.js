//#region Place Order With COD -> api/v1/order/place-order
export const placeOrderWithCOD = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { paymentType, address, items } = req.body;
  } catch (error) {
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

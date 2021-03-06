import * as functions from 'firebase-functions'
import { stripe_regions } from '../common/constant'
import Stripe from 'stripe'

const locale = functions.config().locale;
export const region = (locale && locale.region) || "US";
export const stripe_region = stripe_regions[region] || stripe_regions["US"];

export const validate_auth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.')
  }
  return context.auth.uid
}

export const get_stripe = () => {
  const STRIPE_SECRET_KEY = functions.config().stripe.secret_key
  if (!STRIPE_SECRET_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_SECRET_KEY.')
  }
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-03-02' })
}

export const validate_params = (params) => {
  const errors = Object.keys(params).filter(key => {
    return params[key] === undefined;
  })
  if (errors.length > 0) {
    throw new functions.https.HttpsError('invalid-argument',
      'Missing parameters.', { params: errors }
    )
  }
}

export const get_restaurant = async (db: FirebaseFirestore.Firestore, restaurantId: String) => {
  const snapshot = await db.doc(`/restaurants/${restaurantId}`).get()
  const data = snapshot.data()
  if (!data) {
    throw new functions.https.HttpsError('invalid-argument', 'There is no restaurant with this id.')
  }
  return data;
}

export const process_error = (error: any) => {
  console.error(error)
  if (error instanceof functions.https.HttpsError) {
    return error
  }
  return new functions.https.HttpsError("internal", error.message, error);
}


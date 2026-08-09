import { cacheLife, cacheTag } from "next/cache";
import { Country, State } from "country-state-city";

import { Event, type IEvent } from "@/database/event.model";
import connectToDatabase from "@/lib/mongodb";
import { ALL_TAGS } from "@/lib/constants/event-taxonomy";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";

export const SEO_EVENTS_CACHE_TAG = "events";

export type SeoEventCard = Pick<
  IEvent,
  "title" | "slug" | "location" | "date" | "time" | "image"
> & {
  _id: string;
};

type SeoEventDocument = SeoEventCard & {
  tags?: string[];
  country?: string;
  state?: string;
  city?: string;
  category?: string;
  tagSlugs?: string[];
  countrySlug?: string;
  stateSlug?: string;
  citySlug?: string;
  categorySlug?: string;
};

const EVENT_CARD_SELECT =
  "_id title slug location date time image tags country state city category tagSlugs countrySlug stateSlug citySlug categorySlug";

export const slugifySegment = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const titleizeFromSlug = (value: string): string =>
  value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const normalizeCards = (events: SeoEventDocument[]): SeoEventCard[] =>
  events.map((event) => ({
    _id: String(event._id),
    title: event.title,
    slug: event.slug,
    location: event.location,
    date: event.date,
    time: event.time,
    image: event.image,
  }));

async function getCachedEventDocuments(query: Record<string, unknown>): Promise<SeoEventDocument[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SEO_EVENTS_CACHE_TAG);

  await connectToDatabase();

  const events = await Event.find(query)
    .select(EVENT_CARD_SELECT)
    .sort({ createdAt: -1 })
    .lean<SeoEventDocument[]>()
    .exec();

  return JSON.parse(JSON.stringify(events));
}

export const getAllSeoEventCards = async (): Promise<SeoEventCard[]> =>
  normalizeCards(await getCachedEventDocuments({}));

const getTagLabelBySlug = (tagSlug: string): string | null => {
  const match = ALL_TAGS.find((entry) => slugifySegment(entry.tag) === tagSlug);
  return match?.tag ?? null;
};

const getCategoryLabelBySlug = (categorySlug: string): string | null => {
  const match = EVENT_CATEGORIES.find((category) => slugifySegment(category) === categorySlug);
  return match ?? null;
};

const getCountryBySlug = (countrySlug: string) => {
  const normalizedSlug = slugifySegment(countrySlug);
  return Country.getAllCountries().find(
    (country) =>
      slugifySegment(country.name) === normalizedSlug ||
      slugifySegment(country.isoCode) === normalizedSlug
  );
};

const getStateBySlug = (countryCode: string, stateSlug: string) => {
  const normalizedSlug = slugifySegment(stateSlug);
  return State.getStatesOfCountry(countryCode).find(
    (state) =>
      slugifySegment(state.name) === normalizedSlug ||
      slugifySegment(state.isoCode) === normalizedSlug
  );
};

const getCityLabel = (citySlug: string): string => {
  const normalizedCitySlug = slugifySegment(citySlug);
  return titleizeFromSlug(normalizedCitySlug);
};

const resolveEventsByFallback = async (
  predicate: (event: SeoEventDocument) => boolean
): Promise<SeoEventCard[]> => {
  const allEvents = await getCachedEventDocuments({});
  return normalizeCards(allEvents.filter(predicate));
};

export const getSeoTagEvents = async (tagSlug: string): Promise<SeoEventCard[]> => {
  const normalizedTagSlug = slugifySegment(tagSlug);
  const knownTag = getTagLabelBySlug(normalizedTagSlug);

  const primaryQuery = knownTag
    ? {
        $or: [{ tagSlugs: normalizedTagSlug }, { tags: knownTag }],
      }
    : { tagSlugs: normalizedTagSlug };

  const primaryResults = normalizeCards(await getCachedEventDocuments(primaryQuery));
  if (primaryResults.length > 0) {
    return primaryResults;
  }

  return resolveEventsByFallback(
    (event) => event.tags?.some((tag) => slugifySegment(tag) === normalizedTagSlug) ?? false
  );
};

export const getSeoCategoryEvents = async (categorySlug: string): Promise<SeoEventCard[] | null> => {
  const normalizedCategorySlug = slugifySegment(categorySlug);
  const categoryLabel = getCategoryLabelBySlug(normalizedCategorySlug);

  if (!categoryLabel) {
    return null;
  }

  const primaryResults = normalizeCards(await getCachedEventDocuments({
    $or: [{ categorySlug: normalizedCategorySlug }, { category: categoryLabel }],
  }));

  if (primaryResults.length > 0) {
    return primaryResults;
  }

  return resolveEventsByFallback(
    (event) => slugifySegment(event.category ?? "") === normalizedCategorySlug
  );
};

export const getSeoCountryEvents = async (countrySlug: string): Promise<SeoEventCard[] | null> => {
  const country = getCountryBySlug(countrySlug);
  if (!country) {
    return null;
  }

  const normalizedCountrySlug = slugifySegment(country.name);
  const primaryResults = normalizeCards(await getCachedEventDocuments({
    $or: [{ countrySlug: normalizedCountrySlug }, { country: country.name }],
  }));

  if (primaryResults.length > 0) {
    return primaryResults;
  }

  return resolveEventsByFallback(
    (event) => slugifySegment(event.country ?? "") === normalizedCountrySlug
  );
};

export const getSeoStateEvents = async (
  countrySlug: string,
  stateSlug: string
): Promise<{ country: string; state: string; events: SeoEventCard[] } | null> => {
  const country = getCountryBySlug(countrySlug);
  if (!country) {
    return null;
  }

  const state = getStateBySlug(country.isoCode, stateSlug);
  if (!state) {
    return null;
  }

  const normalizedCountrySlug = slugifySegment(country.name);
  const normalizedStateSlug = slugifySegment(state.name);

  const primaryResults = normalizeCards(await getCachedEventDocuments({
    $or: [
      {
        countrySlug: normalizedCountrySlug,
        stateSlug: normalizedStateSlug,
      },
      {
        country: country.name,
        state: state.name,
      },
    ],
  }));

  if (primaryResults.length > 0) {
    return {
      country: country.name,
      state: state.name,
      events: primaryResults,
    };
  }

  const fallbackEvents = await resolveEventsByFallback(
    (event) =>
      slugifySegment(event.country ?? "") === normalizedCountrySlug &&
      slugifySegment(event.state ?? "") === normalizedStateSlug
  );

  return {
    country: country.name,
    state: state.name,
    events: fallbackEvents,
  };
};

export const getSeoCityEvents = async (
  countrySlug: string,
  stateSlug: string,
  citySlug: string
): Promise<{ country: string; state: string; city: string; events: SeoEventCard[] } | null> => {
  const stateResult = await getSeoStateEvents(countrySlug, stateSlug);
  if (!stateResult) {
    return null;
  }

  const normalizedCitySlug = slugifySegment(citySlug);
  const primaryDocuments = await getCachedEventDocuments({
    $or: [
      {
        countrySlug: slugifySegment(stateResult.country),
        stateSlug: slugifySegment(stateResult.state),
      },
      {
        country: stateResult.country,
        state: stateResult.state,
      },
    ],
  });

  const events =
    primaryDocuments.length > 0
      ? normalizeCards(
          primaryDocuments.filter(
          (event) =>
            slugifySegment(event.city ?? "") === normalizedCitySlug ||
            slugifySegment(event.citySlug ?? "") === normalizedCitySlug
          )
        )
      : await resolveEventsByFallback(
          (event) =>
            slugifySegment(event.country ?? "") === slugifySegment(stateResult.country) &&
            slugifySegment(event.state ?? "") === slugifySegment(stateResult.state) &&
            slugifySegment(event.city ?? "") === normalizedCitySlug
        );

  return {
    country: stateResult.country,
    state: stateResult.state,
    city: getCityLabel(normalizedCitySlug),
    events,
  };
};

export const resolveTagLabel = (tagSlug: string): string | null =>
  getTagLabelBySlug(slugifySegment(tagSlug));

export const resolveCategoryLabel = (categorySlug: string): string | null =>
  getCategoryLabelBySlug(slugifySegment(categorySlug));

export const resolveCountryLabel = (countrySlug: string): string | null => {
  const country = getCountryBySlug(countrySlug);
  return country?.name ?? null;
};

export const resolveStateLabel = (
  countrySlug: string,
  stateSlug: string
): { country: string; state: string } | null => {
  const country = getCountryBySlug(countrySlug);
  if (!country) {
    return null;
  }

  const state = getStateBySlug(country.isoCode, stateSlug);
  if (!state) {
    return null;
  }

  return {
    country: country.name,
    state: state.name,
  };
};

export const fallbackLabelFromSlug = (value: string): string =>
  titleizeFromSlug(slugifySegment(value));
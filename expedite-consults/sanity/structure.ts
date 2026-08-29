import {
	BlockContentIcon,
	CaseIcon,
	CogIcon,
	CommentIcon,
	VersionsIcon,
} from "@sanity/icons";
import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
	S.list()
		.title("Admin Dashboard")
		.items([
			S.listItem()
				.title("Services")
				.icon(CaseIcon)
				.child(S.documentTypeList("service").title("Services")),

			S.divider(),
			// Insights grouped by category
			S.listItem()
				.title("Insights")
				.icon(BlockContentIcon)
				.child(
					S.documentTypeList("category")
						.title("Categories")
						.child((categoryId) =>
							S.documentList()
								.title("Insights in this Category")
								.filter('_type == "insight" && category._ref == $categoryId')
								.params({ categoryId })
						)
				),

			// S.documentTypeListItem("insight").title("Insights"),
			// S.documentTypeListItem("category").title("Categories"),
			// S.documentTypeListItem("author").title("Authors"),
			S.divider(),

			S.listItem()
				.title("Testimonials")
				.icon(CommentIcon)
				.child(S.documentTypeList("testimonial").title("Testimonials")),

			S.divider(),

			S.listItem()
				.title("Legal")
				.icon(VersionsIcon)
				.child(S.documentTypeList("legal").title("Legal")),

			S.divider(),

			S.listItem()
				.title("Site Settings")
				.icon(CogIcon)
				.child(S.documentTypeList("siteSettings").title("Site Settings")),

			// S.divider(),
			// ...S.documentTypeListItems().filter(
			// 	(item) =>
			// 		item.getId() &&
			// 		!["insight", "category", "author", "testimonial", "legal"].includes(
			// 			item.getId()!
			// 		)
			// ),
			S.divider(),
			// System Management
			S.listItem()
				.title("System Management")
				.child(
					S.list()
						.title("System Management")
						.items([
							S.documentTypeListItem("category").title("Insight Categories"),
							S.documentTypeListItem("serviceContent").title("Service Content"),
							S.documentTypeListItem("frameworkContent").title(
								"Framework Content"
							),
							S.documentTypeListItem("benefits").title("Benefits"),
						])
				),
		]);

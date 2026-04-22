import { MediaEditView as MediaEditView_df3ef0ef470943d746c9ba2b0086c0bc } from '@/views/media/MediaEditView'
import { MediaListView as MediaListView_854429258c2cfc066125112d357386ee } from '@/views/media/MediaListView'
import { BackgroundMediaField as BackgroundMediaField_588e541024d75ae13fa102519f9d0517 } from '@/components/fields/BackgroundMediaField'
import { RscEntryLexicalCell as RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e } from '@payloadcms/richtext-lexical/rsc'
import { RscEntryLexicalField as RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e } from '@payloadcms/richtext-lexical/rsc'
import { LexicalDiffComponent as LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e } from '@payloadcms/richtext-lexical/rsc'
import { HeadingFeatureClient as HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { BoldFeatureClient as BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { ItalicFeatureClient as ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { FixedToolbarFeatureClient as FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864 } from '@payloadcms/richtext-lexical/client'
import { SimpleMediaField as SimpleMediaField_bbff102bc11ec55a4495b459a5288ad6 } from '@/components/fields/SimpleMediaField'
import { ProjectEditView as ProjectEditView_6469beb9074e3bf25747889cc8bcf617 } from '@/views/projects/ProjectEditView'
import { ProjectsListView as ProjectsListView_2cb0348078ae8ac01eed063abbe73527 } from '@/views/projects/ProjectsListView'
import { ColorPickerField as ColorPickerField_b6f500839fb27e15e2263e5dd3b4d8d8 } from '@/components/fields/ColorPickerField'
import { HeroMediaField as HeroMediaField_37a22d70a65701b87a191da4efe0b4a9 } from '@/components/fields/HeroMediaField'
import { ProfileEditView as ProfileEditView_0347149381ad778515b954e0d4266324 } from '@/views/profiles/ProfileEditView'
import { ProfilesListView as ProfilesListView_0b0fc4d66c7fa7ee7f6a707840377ba7 } from '@/views/profiles/ProfilesListView'
import { MuxRenameField as MuxRenameField_98087ce1ab7c47816bda8a9ab4d734d5 } from '@/mux/plugin/components/MuxRenameField'
import { MuxThumbnailCell as MuxThumbnailCell_39643252a95575ace62af5cd7cdb4cbe } from '@/mux/plugin/components/MuxThumbnailCell'
import { MuxUploadField as MuxUploadField_b63c6e82325435caad486739765e11d4 } from '@/mux/plugin/components/MuxUploadField'
import { MuxDeleteField as MuxDeleteField_43f59e871aa0458d0044cc176bcb0b93 } from '@/mux/plugin/components/MuxDeleteField'
import { MuxHiddenSaveButton as MuxHiddenSaveButton_d064be15088fcfe79e6a386a1c9b32e4 } from '@/mux/plugin/components/MuxHiddenSaveButton'
import { MuxVideoEditView as MuxVideoEditView_7fdf528802147f2fd5cd2086dfe09ff3 } from '@/views/mux/MuxVideoEditView'
import { MuxVideosListView as MuxVideosListView_49ca8f4f7891d2f08d73c2c61efb3874 } from '@/views/mux/MuxVideosListView'
import { FeaturedProjectsField as FeaturedProjectsField_a244d95b7e3fb6e88f5e6ce616b885ba } from '@/components/fields/FeaturedProjectsField'
import { WorkEditView as WorkEditView_a47be0f755aa361e46f341d1160bfe7b } from '@/views/work/WorkEditView'
import { NavEditView as NavEditView_31ea8114955eea4abe29a8df13d9d7e5 } from '@/views/nav/NavEditView'
import { DashboardView as DashboardView_7010f5cd38ddc45803d5cf95fe528667 } from '@/dashboard/DashboardView'
import { ContentDashboard as ContentDashboard_5fa933d2947527eb56be836fe57fc846 } from '@/dashboard/ContentDashboard'
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'

/** @type import('payload').ImportMap */
export const importMap = {
  "@/views/media/MediaEditView#MediaEditView": MediaEditView_df3ef0ef470943d746c9ba2b0086c0bc,
  "@/views/media/MediaListView#MediaListView": MediaListView_854429258c2cfc066125112d357386ee,
  "@/components/fields/BackgroundMediaField#BackgroundMediaField": BackgroundMediaField_588e541024d75ae13fa102519f9d0517,
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell": RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#RscEntryLexicalField": RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/rsc#LexicalDiffComponent": LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  "@payloadcms/richtext-lexical/client#HeadingFeatureClient": HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#BoldFeatureClient": BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#ItalicFeatureClient": ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@payloadcms/richtext-lexical/client#FixedToolbarFeatureClient": FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  "@/components/fields/SimpleMediaField#SimpleMediaField": SimpleMediaField_bbff102bc11ec55a4495b459a5288ad6,
  "@/views/projects/ProjectEditView#ProjectEditView": ProjectEditView_6469beb9074e3bf25747889cc8bcf617,
  "@/views/projects/ProjectsListView#ProjectsListView": ProjectsListView_2cb0348078ae8ac01eed063abbe73527,
  "@/components/fields/ColorPickerField#ColorPickerField": ColorPickerField_b6f500839fb27e15e2263e5dd3b4d8d8,
  "@/components/fields/HeroMediaField#HeroMediaField": HeroMediaField_37a22d70a65701b87a191da4efe0b4a9,
  "@/views/profiles/ProfileEditView#ProfileEditView": ProfileEditView_0347149381ad778515b954e0d4266324,
  "@/views/profiles/ProfilesListView#ProfilesListView": ProfilesListView_0b0fc4d66c7fa7ee7f6a707840377ba7,
  "@/mux/plugin/components/MuxRenameField#MuxRenameField": MuxRenameField_98087ce1ab7c47816bda8a9ab4d734d5,
  "@/mux/plugin/components/MuxThumbnailCell#MuxThumbnailCell": MuxThumbnailCell_39643252a95575ace62af5cd7cdb4cbe,
  "@/mux/plugin/components/MuxUploadField#MuxUploadField": MuxUploadField_b63c6e82325435caad486739765e11d4,
  "@/mux/plugin/components/MuxDeleteField#MuxDeleteField": MuxDeleteField_43f59e871aa0458d0044cc176bcb0b93,
  "@/mux/plugin/components/MuxHiddenSaveButton#MuxHiddenSaveButton": MuxHiddenSaveButton_d064be15088fcfe79e6a386a1c9b32e4,
  "@/views/mux/MuxVideoEditView#MuxVideoEditView": MuxVideoEditView_7fdf528802147f2fd5cd2086dfe09ff3,
  "@/views/mux/MuxVideosListView#MuxVideosListView": MuxVideosListView_49ca8f4f7891d2f08d73c2c61efb3874,
  "@/components/fields/FeaturedProjectsField#FeaturedProjectsField": FeaturedProjectsField_a244d95b7e3fb6e88f5e6ce616b885ba,
  "@/views/work/WorkEditView#WorkEditView": WorkEditView_a47be0f755aa361e46f341d1160bfe7b,
  "@/views/nav/NavEditView#NavEditView": NavEditView_31ea8114955eea4abe29a8df13d9d7e5,
  "@/dashboard/DashboardView#DashboardView": DashboardView_7010f5cd38ddc45803d5cf95fe528667,
  "@/dashboard/ContentDashboard#ContentDashboard": ContentDashboard_5fa933d2947527eb56be836fe57fc846,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1
}

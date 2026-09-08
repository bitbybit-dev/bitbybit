import { describe, it, expect } from "vitest";
import * as Inputs from "./index";

// Every parameter object the BabylonJS layer accepts, across all of its namespaces. These carry no
// behaviour beyond two things, and both are load-bearing: the defaults they declare are what the
// visual editors are generated from, and each constructor argument has to land on the property of
// the same name - a constructor whose parameters slipped out of order would build the wrong thing
// silently.
//
// The table below is every DTO those namespaces export. A class missing from it is a class no test
// constructs; the cases below then run against all of them.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDto = new (...args: any[]) => object;

const DTOS: [string, AnyDto][] = [
    ["BabylonCamera.ArcRotateCameraDto", Inputs.BabylonCamera.ArcRotateCameraDto],
    ["BabylonCamera.FreeCameraDto", Inputs.BabylonCamera.FreeCameraDto],
    ["BabylonCamera.TargetCameraDto", Inputs.BabylonCamera.TargetCameraDto],
    ["BabylonCamera.PositionDto", Inputs.BabylonCamera.PositionDto],
    ["BabylonCamera.SpeedDto", Inputs.BabylonCamera.SpeedDto],
    ["BabylonCamera.TargetDto", Inputs.BabylonCamera.TargetDto],
    ["BabylonCamera.MinZDto", Inputs.BabylonCamera.MinZDto],
    ["BabylonCamera.MaxZDto", Inputs.BabylonCamera.MaxZDto],
    ["BabylonCamera.OrthographicDto", Inputs.BabylonCamera.OrthographicDto],
    ["BabylonCamera.CameraDto", Inputs.BabylonCamera.CameraDto],
    ["BabylonDecal.CreateMeshDecalDto", Inputs.BabylonDecal.CreateMeshDecalDto],
    ["BabylonDecal.EnableDecalMapDto", Inputs.BabylonDecal.EnableDecalMapDto],
    ["BabylonDecal.ProjectDecalDto", Inputs.BabylonDecal.ProjectDecalDto],
    ["BabylonDecal.DecalMapDto", Inputs.BabylonDecal.DecalMapDto],
    ["BabylonGaussianSplatting.CreateGaussianSplattingMeshDto", Inputs.BabylonGaussianSplatting.CreateGaussianSplattingMeshDto],
    ["BabylonGaussianSplatting.GaussianSplattingMeshDto", Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto],
    ["BabylonGizmo.CreateGizmoDto", Inputs.BabylonGizmo.CreateGizmoDto],
    ["BabylonGizmo.GizmoDto", Inputs.BabylonGizmo.GizmoDto],
    ["BabylonGizmo.SetGizmoScaleRatioDto", Inputs.BabylonGizmo.SetGizmoScaleRatioDto],
    ["BabylonGizmo.GizmoManagerDto", Inputs.BabylonGizmo.GizmoManagerDto],
    ["BabylonGizmo.PositionGizmoDto", Inputs.BabylonGizmo.PositionGizmoDto],
    ["BabylonGizmo.SetPlanarGizmoEnabled", Inputs.BabylonGizmo.SetPlanarGizmoEnabled],
    ["BabylonGizmo.SetScaleGizmoSnapDistanceDto", Inputs.BabylonGizmo.SetScaleGizmoSnapDistanceDto],
    ["BabylonGizmo.SetScaleGizmoIncrementalSnapDto", Inputs.BabylonGizmo.SetScaleGizmoIncrementalSnapDto],
    ["BabylonGizmo.SetScaleGizmoSensitivityDto", Inputs.BabylonGizmo.SetScaleGizmoSensitivityDto],
    ["BabylonGizmo.ScaleGizmoDto", Inputs.BabylonGizmo.ScaleGizmoDto],
    ["BabylonGizmo.BoundingBoxGizmoDto", Inputs.BabylonGizmo.BoundingBoxGizmoDto],
    ["BabylonGizmo.SetBoundingBoxGizmoRotationSphereSizeDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSphereSizeDto],
    ["BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDto],
    ["BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshBoundsSizeDto],
    ["BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoFixedDragMeshScreenSizeDistanceFactorDto],
    ["BabylonGizmo.SetBoundingBoxGizmoScalingSnapDistanceDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoScalingSnapDistanceDto],
    ["BabylonGizmo.SetBoundingBoxGizmoRotationSnapDistanceDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoRotationSnapDistanceDto],
    ["BabylonGizmo.SetBoundingBoxGizmoScaleBoxSizeDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleBoxSizeDto],
    ["BabylonGizmo.SetBoundingBoxGizmoIncrementalSnapDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoIncrementalSnapDto],
    ["BabylonGizmo.SetBoundingBoxGizmoScalePivotDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoScalePivotDto],
    ["BabylonGizmo.SetBoundingBoxGizmoAxisFactorDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoAxisFactorDto],
    ["BabylonGizmo.SetBoundingBoxGizmoScaleDragSpeedDto", Inputs.BabylonGizmo.SetBoundingBoxGizmoScaleDragSpeedDto],
    ["BabylonGizmo.SetPositionGizmoSnapDistanceDto", Inputs.BabylonGizmo.SetPositionGizmoSnapDistanceDto],
    ["BabylonGizmo.SetRotationGizmoSnapDistanceDto", Inputs.BabylonGizmo.SetRotationGizmoSnapDistanceDto],
    ["BabylonGizmo.SetRotationGizmoSensitivityDto", Inputs.BabylonGizmo.SetRotationGizmoSensitivityDto],
    ["BabylonGizmo.RotationGizmoDto", Inputs.BabylonGizmo.RotationGizmoDto],
    ["BabylonGizmo.AxisScaleGizmoDto", Inputs.BabylonGizmo.AxisScaleGizmoDto],
    ["BabylonGizmo.SetIsEnabledAxisScaleGizmoDto", Inputs.BabylonGizmo.SetIsEnabledAxisScaleGizmoDto],
    ["BabylonGizmo.AxisDragGizmoDto", Inputs.BabylonGizmo.AxisDragGizmoDto],
    ["BabylonGizmo.SetIsEnabledAxisDragGizmoDto", Inputs.BabylonGizmo.SetIsEnabledAxisDragGizmoDto],
    ["BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto", Inputs.BabylonGizmo.SetIsEnabledPlaneRotationGizmoDto],
    ["BabylonGizmo.SetIsEnabledPlaneDragGizmoDto", Inputs.BabylonGizmo.SetIsEnabledPlaneDragGizmoDto],
    ["BabylonGizmo.PlaneDragGizmoDto", Inputs.BabylonGizmo.PlaneDragGizmoDto],
    ["BabylonGizmo.PlaneRotationGizmoDto", Inputs.BabylonGizmo.PlaneRotationGizmoDto],
    ["BabylonGizmo.AttachToMeshDto", Inputs.BabylonGizmo.AttachToMeshDto],
    ["BabylonGizmo.PositionGizmoObservableSelectorDto", Inputs.BabylonGizmo.PositionGizmoObservableSelectorDto],
    ["BabylonGizmo.BoundingBoxGizmoObservableSelectorDto", Inputs.BabylonGizmo.BoundingBoxGizmoObservableSelectorDto],
    ["BabylonGizmo.RotationGizmoObservableSelectorDto", Inputs.BabylonGizmo.RotationGizmoObservableSelectorDto],
    ["BabylonGizmo.ScaleGizmoObservableSelectorDto", Inputs.BabylonGizmo.ScaleGizmoObservableSelectorDto],
    ["BabylonGltf.AssetContainerDto", Inputs.BabylonGltf.AssetContainerDto],
    ["BabylonGltf.GltfRootNodeDto", Inputs.BabylonGltf.GltfRootNodeDto],
    ["BabylonGltf.SelectVariantDto", Inputs.BabylonGltf.SelectVariantDto],
    ["BabylonGltf.PlayAnimationGroupDto", Inputs.BabylonGltf.PlayAnimationGroupDto],
    ["BabylonGltf.AnimationGroupDto", Inputs.BabylonGltf.AnimationGroupDto],
    ["BabylonGui.CreateFullScreenUIDto", Inputs.BabylonGui.CreateFullScreenUIDto],
    ["BabylonGui.CreateForMeshDto", Inputs.BabylonGui.CreateForMeshDto],
    ["BabylonGui.CreateStackPanelDto", Inputs.BabylonGui.CreateStackPanelDto],
    ["BabylonGui.SetStackPanelIsVerticalDto", Inputs.BabylonGui.SetStackPanelIsVerticalDto],
    ["BabylonGui.SetStackPanelSpacingDto", Inputs.BabylonGui.SetStackPanelSpacingDto],
    ["BabylonGui.SetStackPanelWidthDto", Inputs.BabylonGui.SetStackPanelWidthDto],
    ["BabylonGui.SetStackPanelHeightDto", Inputs.BabylonGui.SetStackPanelHeightDto],
    ["BabylonGui.StackPanelDto", Inputs.BabylonGui.StackPanelDto],
    ["BabylonGui.SliderObservableSelectorDto", Inputs.BabylonGui.SliderObservableSelectorDto],
    ["BabylonGui.ColorPickerObservableSelectorDto", Inputs.BabylonGui.ColorPickerObservableSelectorDto],
    ["BabylonGui.InputTextObservableSelectorDto", Inputs.BabylonGui.InputTextObservableSelectorDto],
    ["BabylonGui.RadioButtonObservableSelectorDto", Inputs.BabylonGui.RadioButtonObservableSelectorDto],
    ["BabylonGui.CheckboxObservableSelectorDto", Inputs.BabylonGui.CheckboxObservableSelectorDto],
    ["BabylonGui.ControlObservableSelectorDto", Inputs.BabylonGui.ControlObservableSelectorDto],
    ["BabylonGui.TextBlockObservableSelectorDto", Inputs.BabylonGui.TextBlockObservableSelectorDto],
    ["BabylonGui.ContainerDto", Inputs.BabylonGui.ContainerDto],
    ["BabylonGui.AddControlsToContainerDto", Inputs.BabylonGui.AddControlsToContainerDto],
    ["BabylonGui.GetControlByNameDto", Inputs.BabylonGui.GetControlByNameDto],
    ["BabylonGui.SetControlIsVisibleDto", Inputs.BabylonGui.SetControlIsVisibleDto],
    ["BabylonGui.SetControlIsReadonlyDto", Inputs.BabylonGui.SetControlIsReadonlyDto],
    ["BabylonGui.SetControlIsEnabledDto", Inputs.BabylonGui.SetControlIsEnabledDto],
    ["BabylonGui.CreateImageDto", Inputs.BabylonGui.CreateImageDto],
    ["BabylonGui.SetImageUrlDto", Inputs.BabylonGui.SetImageUrlDto],
    ["BabylonGui.ImageDto", Inputs.BabylonGui.ImageDto],
    ["BabylonGui.CreateButtonDto", Inputs.BabylonGui.CreateButtonDto],
    ["BabylonGui.SetButtonTextDto", Inputs.BabylonGui.SetButtonTextDto],
    ["BabylonGui.ButtonDto", Inputs.BabylonGui.ButtonDto],
    ["BabylonGui.CreateColorPickerDto", Inputs.BabylonGui.CreateColorPickerDto],
    ["BabylonGui.SetColorPickerValueDto", Inputs.BabylonGui.SetColorPickerValueDto],
    ["BabylonGui.SetColorPickerSizeDto", Inputs.BabylonGui.SetColorPickerSizeDto],
    ["BabylonGui.ColorPickerDto", Inputs.BabylonGui.ColorPickerDto],
    ["BabylonGui.CreateCheckboxDto", Inputs.BabylonGui.CreateCheckboxDto],
    ["BabylonGui.SetControlFontSizeDto", Inputs.BabylonGui.SetControlFontSizeDto],
    ["BabylonGui.SetControlHeightDto", Inputs.BabylonGui.SetControlHeightDto],
    ["BabylonGui.SetControlWidthDto", Inputs.BabylonGui.SetControlWidthDto],
    ["BabylonGui.SetControlColorDto", Inputs.BabylonGui.SetControlColorDto],
    ["BabylonGui.SetContainerBackgroundDto", Inputs.BabylonGui.SetContainerBackgroundDto],
    ["BabylonGui.SetContainerIsReadonlyDto", Inputs.BabylonGui.SetContainerIsReadonlyDto],
    ["BabylonGui.SetCheckboxBackgroundDto", Inputs.BabylonGui.SetCheckboxBackgroundDto],
    ["BabylonGui.SetCheckboxCheckSizeRatioDto", Inputs.BabylonGui.SetCheckboxCheckSizeRatioDto],
    ["BabylonGui.CheckboxDto", Inputs.BabylonGui.CheckboxDto],
    ["BabylonGui.ControlDto", Inputs.BabylonGui.ControlDto],
    ["BabylonGui.SetCheckboxIsCheckedDto", Inputs.BabylonGui.SetCheckboxIsCheckedDto],
    ["BabylonGui.CreateInputTextDto", Inputs.BabylonGui.CreateInputTextDto],
    ["BabylonGui.SetInputTextBackgroundDto", Inputs.BabylonGui.SetInputTextBackgroundDto],
    ["BabylonGui.SetInputTextTextDto", Inputs.BabylonGui.SetInputTextTextDto],
    ["BabylonGui.SetInputTextPlaceholderDto", Inputs.BabylonGui.SetInputTextPlaceholderDto],
    ["BabylonGui.InputTextDto", Inputs.BabylonGui.InputTextDto],
    ["BabylonGui.CreateRadioButtonDto", Inputs.BabylonGui.CreateRadioButtonDto],
    ["BabylonGui.SetRadioButtonCheckSizeRatioDto", Inputs.BabylonGui.SetRadioButtonCheckSizeRatioDto],
    ["BabylonGui.SetRadioButtonGroupDto", Inputs.BabylonGui.SetRadioButtonGroupDto],
    ["BabylonGui.SetRadioButtonBackgroundDto", Inputs.BabylonGui.SetRadioButtonBackgroundDto],
    ["BabylonGui.RadioButtonDto", Inputs.BabylonGui.RadioButtonDto],
    ["BabylonGui.CreateSliderDto", Inputs.BabylonGui.CreateSliderDto],
    ["BabylonGui.CreateTextBlockDto", Inputs.BabylonGui.CreateTextBlockDto],
    ["BabylonGui.SetTextBlockTextDto", Inputs.BabylonGui.SetTextBlockTextDto],
    ["BabylonGui.SetTextBlockResizeToFitDto", Inputs.BabylonGui.SetTextBlockResizeToFitDto],
    ["BabylonGui.SetTextBlockTextWrappingDto", Inputs.BabylonGui.SetTextBlockTextWrappingDto],
    ["BabylonGui.SetTextBlockLineSpacingDto", Inputs.BabylonGui.SetTextBlockLineSpacingDto],
    ["BabylonGui.TextBlockDto", Inputs.BabylonGui.TextBlockDto],
    ["BabylonGui.SliderThumbDto", Inputs.BabylonGui.SliderThumbDto],
    ["BabylonGui.SliderDto", Inputs.BabylonGui.SliderDto],
    ["BabylonGui.SliderBorderColorDto", Inputs.BabylonGui.SliderBorderColorDto],
    ["BabylonGui.SliderBackgroundColorDto", Inputs.BabylonGui.SliderBackgroundColorDto],
    ["BabylonGui.SetSliderValueDto", Inputs.BabylonGui.SetSliderValueDto],
    ["BabylonGui.PaddingLeftRightTopBottomDto", Inputs.BabylonGui.PaddingLeftRightTopBottomDto],
    ["BabylonGui.CloneControlDto", Inputs.BabylonGui.CloneControlDto],
    ["BabylonGui.AlignmentDto", Inputs.BabylonGui.AlignmentDto<unknown>],
    ["BabylonGui.SetTextBlockTextOutlineDto", Inputs.BabylonGui.SetTextBlockTextOutlineDto],
    ["BabylonIO.ExportSceneGlbDto", Inputs.BabylonIO.ExportSceneGlbDto],
    ["BabylonIO.ExportSceneDto", Inputs.BabylonIO.ExportSceneDto],
    ["BabylonIO.ExportMeshToStlDto", Inputs.BabylonIO.ExportMeshToStlDto],
    ["BabylonIO.ExportMeshesToStlDto", Inputs.BabylonIO.ExportMeshesToStlDto],
    ["BabylonLight.ShadowLightDirectionToTargetDto", Inputs.BabylonLight.ShadowLightDirectionToTargetDto],
    ["BabylonLight.ShadowLightPositionDto", Inputs.BabylonLight.ShadowLightPositionDto],
    ["BabylonMaterial.PBRMetallicRoughnessDto", Inputs.BabylonMaterial.PBRMetallicRoughnessDto],
    ["BabylonMaterial.BaseColorDto", Inputs.BabylonMaterial.BaseColorDto],
    ["BabylonMaterial.MaterialPropDto", Inputs.BabylonMaterial.MaterialPropDto],
    ["BabylonMaterial.SkyMaterialPropDto", Inputs.BabylonMaterial.SkyMaterialPropDto],
    ["BabylonMaterial.MetallicDto", Inputs.BabylonMaterial.MetallicDto],
    ["BabylonMaterial.RoughnessDto", Inputs.BabylonMaterial.RoughnessDto],
    ["BabylonMaterial.AlphaDto", Inputs.BabylonMaterial.AlphaDto],
    ["BabylonMaterial.BackFaceCullingDto", Inputs.BabylonMaterial.BackFaceCullingDto],
    ["BabylonMaterial.BaseTextureDto", Inputs.BabylonMaterial.BaseTextureDto],
    ["BabylonMaterial.SkyMaterialDto", Inputs.BabylonMaterial.SkyMaterialDto],
    ["BabylonMaterial.LuminanceDto", Inputs.BabylonMaterial.LuminanceDto],
    ["BabylonMaterial.TurbidityDto", Inputs.BabylonMaterial.TurbidityDto],
    ["BabylonMaterial.RayleighDto", Inputs.BabylonMaterial.RayleighDto],
    ["BabylonMaterial.MieCoefficientDto", Inputs.BabylonMaterial.MieCoefficientDto],
    ["BabylonMaterial.MieDirectionalGDto", Inputs.BabylonMaterial.MieDirectionalGDto],
    ["BabylonMaterial.DistanceDto", Inputs.BabylonMaterial.DistanceDto],
    ["BabylonMaterial.InclinationDto", Inputs.BabylonMaterial.InclinationDto],
    ["BabylonMaterial.AzimuthDto", Inputs.BabylonMaterial.AzimuthDto],
    ["BabylonMaterial.SunPositionDto", Inputs.BabylonMaterial.SunPositionDto],
    ["BabylonMaterial.UseSunPositionDto", Inputs.BabylonMaterial.UseSunPositionDto],
    ["BabylonMaterial.CameraOffsetDto", Inputs.BabylonMaterial.CameraOffsetDto],
    ["BabylonMaterial.UpDto", Inputs.BabylonMaterial.UpDto],
    ["BabylonMaterial.DitheringDto", Inputs.BabylonMaterial.DitheringDto],
    ["BabylonMeshBuilder.CreateBoxDto", Inputs.BabylonMeshBuilder.CreateBoxDto],
    ["BabylonMeshBuilder.CreateCubeDto", Inputs.BabylonMeshBuilder.CreateCubeDto],
    ["BabylonMeshBuilder.CreateSquarePlaneDto", Inputs.BabylonMeshBuilder.CreateSquarePlaneDto],
    ["BabylonMeshBuilder.CreateSphereDto", Inputs.BabylonMeshBuilder.CreateSphereDto],
    ["BabylonMeshBuilder.CreateIcoSphereDto", Inputs.BabylonMeshBuilder.CreateIcoSphereDto],
    ["BabylonMeshBuilder.CreateDiscDto", Inputs.BabylonMeshBuilder.CreateDiscDto],
    ["BabylonMeshBuilder.CreateRibbonDto", Inputs.BabylonMeshBuilder.CreateRibbonDto],
    ["BabylonMeshBuilder.CreateTorusDto", Inputs.BabylonMeshBuilder.CreateTorusDto],
    ["BabylonMeshBuilder.CreateTorusKnotDto", Inputs.BabylonMeshBuilder.CreateTorusKnotDto],
    ["BabylonMeshBuilder.CreatePolygonDto", Inputs.BabylonMeshBuilder.CreatePolygonDto],
    ["BabylonMeshBuilder.ExtrudePolygonDto", Inputs.BabylonMeshBuilder.ExtrudePolygonDto],
    ["BabylonMeshBuilder.CreatePolyhedronDto", Inputs.BabylonMeshBuilder.CreatePolyhedronDto],
    ["BabylonMeshBuilder.CreateGeodesicDto", Inputs.BabylonMeshBuilder.CreateGeodesicDto],
    ["BabylonMeshBuilder.CreateCapsuleDto", Inputs.BabylonMeshBuilder.CreateCapsuleDto],
    ["BabylonMeshBuilder.CreateGoldbergDto", Inputs.BabylonMeshBuilder.CreateGoldbergDto],
    ["BabylonMeshBuilder.CreateTubeDto", Inputs.BabylonMeshBuilder.CreateTubeDto],
    ["BabylonMeshBuilder.CreateExtrudedShapeDto", Inputs.BabylonMeshBuilder.CreateExtrudedShapeDto],
    ["BabylonMeshBuilder.CreateCylinderDto", Inputs.BabylonMeshBuilder.CreateCylinderDto],
    ["BabylonMeshBuilder.CreateLatheDto", Inputs.BabylonMeshBuilder.CreateLatheDto],
    ["BabylonMeshBuilder.CreateGroundDto", Inputs.BabylonMeshBuilder.CreateGroundDto],
    ["BabylonMeshBuilder.CreateRectanglePlaneDto", Inputs.BabylonMeshBuilder.CreateRectanglePlaneDto],
    ["BabylonMesh.UpdateDrawnBabylonMesh", Inputs.BabylonMesh.UpdateDrawnBabylonMesh],
    ["BabylonMesh.SetParentDto", Inputs.BabylonMesh.SetParentDto],
    ["BabylonMesh.UpdateDrawnBabylonMeshPositionDto", Inputs.BabylonMesh.UpdateDrawnBabylonMeshPositionDto],
    ["BabylonMesh.UpdateDrawnBabylonMeshRotationDto", Inputs.BabylonMesh.UpdateDrawnBabylonMeshRotationDto],
    ["BabylonMesh.UpdateDrawnBabylonMeshScaleDto", Inputs.BabylonMesh.UpdateDrawnBabylonMeshScaleDto],
    ["BabylonMesh.ScaleInPlaceDto", Inputs.BabylonMesh.ScaleInPlaceDto],
    ["BabylonMesh.IntersectsMeshDto", Inputs.BabylonMesh.IntersectsMeshDto],
    ["BabylonMesh.IntersectsPointDto", Inputs.BabylonMesh.IntersectsPointDto],
    ["BabylonMesh.BabylonMeshDto", Inputs.BabylonMesh.BabylonMeshDto],
    ["BabylonMesh.CloneToPositionsDto", Inputs.BabylonMesh.CloneToPositionsDto],
    ["BabylonMesh.MergeMeshesDto", Inputs.BabylonMesh.MergeMeshesDto],
    ["BabylonMesh.BabylonMeshWithChildrenDto", Inputs.BabylonMesh.BabylonMeshWithChildrenDto],
    ["BabylonMesh.ShowHideMeshDto", Inputs.BabylonMesh.ShowHideMeshDto],
    ["BabylonMesh.CloneBabylonMeshDto", Inputs.BabylonMesh.CloneBabylonMeshDto],
    ["BabylonMesh.ChildMeshesBabylonMeshDto", Inputs.BabylonMesh.ChildMeshesBabylonMeshDto],
    ["BabylonMesh.TranslateBabylonMeshDto", Inputs.BabylonMesh.TranslateBabylonMeshDto],
    ["BabylonMesh.NameBabylonMeshDto", Inputs.BabylonMesh.NameBabylonMeshDto],
    ["BabylonMesh.ByNameBabylonMeshDto", Inputs.BabylonMesh.ByNameBabylonMeshDto],
    ["BabylonMesh.MaterialBabylonMeshDto", Inputs.BabylonMesh.MaterialBabylonMeshDto],
    ["BabylonMesh.IdBabylonMeshDto", Inputs.BabylonMesh.IdBabylonMeshDto],
    ["BabylonMesh.ByIdBabylonMeshDto", Inputs.BabylonMesh.ByIdBabylonMeshDto],
    ["BabylonMesh.UniqueIdBabylonMeshDto", Inputs.BabylonMesh.UniqueIdBabylonMeshDto],
    ["BabylonMesh.PickableBabylonMeshDto", Inputs.BabylonMesh.PickableBabylonMeshDto],
    ["BabylonMesh.CheckCollisionsBabylonMeshDto", Inputs.BabylonMesh.CheckCollisionsBabylonMeshDto],
    ["BabylonMesh.RotateBabylonMeshDto", Inputs.BabylonMesh.RotateBabylonMeshDto],
    ["BabylonMesh.SetMeshVisibilityDto", Inputs.BabylonMesh.SetMeshVisibilityDto],
    ["BabylonMesh.MeshInstanceAndTransformDto", Inputs.BabylonMesh.MeshInstanceAndTransformDto],
    ["BabylonMesh.MeshInstanceDto", Inputs.BabylonMesh.MeshInstanceDto],
    ["BabylonMesh.RotateAroundAxisNodeDto", Inputs.BabylonMesh.RotateAroundAxisNodeDto],
    ["BabylonPick.RayDto", Inputs.BabylonPick.RayDto],
    ["BabylonPick.PickInfo", Inputs.BabylonPick.PickInfo],
    ["BabylonRay.BaseRayDto", Inputs.BabylonRay.BaseRayDto],
    ["BabylonRay.RayDto", Inputs.BabylonRay.RayDto],
    ["BabylonRay.FromToDto", Inputs.BabylonRay.FromToDto],
    ["BabylonJSScene.InitBabylonJSDto", Inputs.BabylonJSScene.InitBabylonJSDto],
    ["BabylonTexture.TextureSimpleDto", Inputs.BabylonTexture.TextureSimpleDto],
    ["BabylonTexture.TextureImageDto", Inputs.BabylonTexture.TextureImageDto],
    ["BabylonTools.ScreenshotDto", Inputs.BabylonTools.ScreenshotDto],
    ["BabylonTransforms.RotationCenterAxisDto", Inputs.BabylonTransforms.RotationCenterAxisDto],
    ["BabylonTransforms.TransformBabylonMeshDto", Inputs.BabylonTransforms.TransformBabylonMeshDto],
    ["BabylonTransforms.RotationCenterDto", Inputs.BabylonTransforms.RotationCenterDto],
    ["BabylonTransforms.RotationCenterYawPitchRollDto", Inputs.BabylonTransforms.RotationCenterYawPitchRollDto],
    ["BabylonTransforms.ScaleXYZDto", Inputs.BabylonTransforms.ScaleXYZDto],
    ["BabylonTransforms.ScaleCenterXYZDto", Inputs.BabylonTransforms.ScaleCenterXYZDto],
    ["BabylonTransforms.UniformScaleDto", Inputs.BabylonTransforms.UniformScaleDto],
    ["BabylonTransforms.UniformScaleFromCenterDto", Inputs.BabylonTransforms.UniformScaleFromCenterDto],
    ["BabylonTransforms.TranslationXYZDto", Inputs.BabylonTransforms.TranslationXYZDto],
    ["BabylonTransforms.TranslationsXYZDto", Inputs.BabylonTransforms.TranslationsXYZDto],
    ["BabylonWebXR.WebXRDefaultExperienceOptions", Inputs.BabylonWebXR.WebXRDefaultExperienceOptions],
    ["BabylonWebXR.DefaultWebXRWithTeleportationDto", Inputs.BabylonWebXR.DefaultWebXRWithTeleportationDto],
    ["BabylonWebXR.WebXRDefaultExperienceDto", Inputs.BabylonWebXR.WebXRDefaultExperienceDto],
    ["BabylonWebXR.WebXRExperienceHelperDto", Inputs.BabylonWebXR.WebXRExperienceHelperDto],
    ["Draw.DrawAny", Inputs.Draw.DrawAny],
    ["Draw.SceneDrawGridMeshDto", Inputs.Draw.SceneDrawGridMeshDto],
    ["Draw.DrawBasicGeometryOptions", Inputs.Draw.DrawBasicGeometryOptions],
    ["Draw.DrawNodeOptions", Inputs.Draw.DrawNodeOptions],
    ["Draw.DrawManifoldOrCrossSectionOptions", Inputs.Draw.DrawManifoldOrCrossSectionOptions],
    ["Draw.DrawOcctShapeOptions", Inputs.Draw.DrawOcctShapeOptions],
    ["Draw.DrawOcctShapeSimpleOptions", Inputs.Draw.DrawOcctShapeSimpleOptions],
    ["Draw.DrawOcctShapeMaterialOptions", Inputs.Draw.DrawOcctShapeMaterialOptions],
    ["Draw.GenericTextureDto", Inputs.Draw.GenericTextureDto],
    ["Draw.GenericPBRMaterialDto", Inputs.Draw.GenericPBRMaterialDto],
    ["BabylonNode.NodeDto", Inputs.BabylonNode.NodeDto],
    ["BabylonNode.NodeTranslationDto", Inputs.BabylonNode.NodeTranslationDto],
    ["BabylonNode.NodeParentDto", Inputs.BabylonNode.NodeParentDto],
    ["BabylonNode.NodeDirectionDto", Inputs.BabylonNode.NodeDirectionDto],
    ["BabylonNode.NodePositionDto", Inputs.BabylonNode.NodePositionDto],
    ["BabylonNode.RotateNodeDto", Inputs.BabylonNode.RotateNodeDto],
    ["BabylonNode.RotateAroundAxisNodeDto", Inputs.BabylonNode.RotateAroundAxisNodeDto],
    ["BabylonNode.CreateNodeFromRotationDto", Inputs.BabylonNode.CreateNodeFromRotationDto],
    ["BabylonNode.DrawNodeDto", Inputs.BabylonNode.DrawNodeDto],
    ["BabylonNode.DrawNodesDto", Inputs.BabylonNode.DrawNodesDto],
    ["BabylonScene.SceneBackgroundColourDto", Inputs.BabylonScene.SceneBackgroundColourDto],
    ["BabylonScene.SceneDto", Inputs.BabylonScene.SceneDto],
    ["BabylonScene.EnablePhysicsDto", Inputs.BabylonScene.EnablePhysicsDto],
    ["BabylonScene.PointLightDto", Inputs.BabylonScene.PointLightDto],
    ["BabylonScene.ActiveCameraDto", Inputs.BabylonScene.ActiveCameraDto],
    ["BabylonScene.UseRightHandedSystemDto", Inputs.BabylonScene.UseRightHandedSystemDto],
    ["BabylonScene.DirectionalLightDto", Inputs.BabylonScene.DirectionalLightDto],
    ["BabylonScene.CameraConfigurationDto", Inputs.BabylonScene.CameraConfigurationDto],
    ["BabylonScene.SkyboxDto", Inputs.BabylonScene.SkyboxDto],
    ["BabylonScene.SkyboxCustomTextureDto", Inputs.BabylonScene.SkyboxCustomTextureDto],
    ["BabylonScene.PointerDto", Inputs.BabylonScene.PointerDto],
    ["BabylonScene.FogDto", Inputs.BabylonScene.FogDto],
    ["BabylonScene.SceneCanvasCSSBackgroundImageDto", Inputs.BabylonScene.SceneCanvasCSSBackgroundImageDto],
    ["BabylonScene.SceneTwoColorLinearGradientDto", Inputs.BabylonScene.SceneTwoColorLinearGradientDto],
    ["BabylonScene.SceneTwoColorRadialGradientDto", Inputs.BabylonScene.SceneTwoColorRadialGradientDto],
    ["BabylonScene.SceneMultiColorLinearGradientDto", Inputs.BabylonScene.SceneMultiColorLinearGradientDto],
    ["BabylonScene.SceneMultiColorRadialGradientDto", Inputs.BabylonScene.SceneMultiColorRadialGradientDto],
    ["BabylonScene.SceneCanvasBackgroundImageDto", Inputs.BabylonScene.SceneCanvasBackgroundImageDto],
];

// A handful of DTOs take their arguments as required rather than optional - a gizmo needs the mesh it
// attaches to, an observable selector the control it watches - so there is nothing for them to fall
// back to and constructing one with nothing leaves those properties unset. They are named here rather
// than detected, so that a DTO changing convention shows up as a change to this list.
const REQUIRES_ITS_ARGUMENTS = new Set([
    "BabylonGizmo.AttachToMeshDto",
    "BabylonGizmo.PositionGizmoObservableSelectorDto",
    "BabylonGizmo.BoundingBoxGizmoObservableSelectorDto",
    "BabylonGizmo.RotationGizmoObservableSelectorDto",
    "BabylonGizmo.ScaleGizmoObservableSelectorDto",
    "BabylonGui.SliderObservableSelectorDto",
    "BabylonGui.ColorPickerObservableSelectorDto",
    "BabylonGui.InputTextObservableSelectorDto",
    "BabylonGui.RadioButtonObservableSelectorDto",
    "BabylonGui.CheckboxObservableSelectorDto",
    "BabylonGui.ControlObservableSelectorDto",
    "BabylonGui.TextBlockObservableSelectorDto",
]);

// Distinct values, one per constructor parameter, so that a parameter landing on the wrong property
// is visible: every one of them has to appear on the object that comes back.
const sentinels = (count: number): unknown[] => Array.from({ length: count }, (_, index) => ({ argument: index }));

describe("the BabylonJS input DTOs", () => {
    describe("constructed with nothing", () => {
        it.each(DTOS.filter(([name]) => !REQUIRES_ITS_ARGUMENTS.has(name)))(
            "%s should carry no property it left undefined",
            (_name, Dto) => {
                // Act
                const built = new Dto();

                // Assert
                expect(Object.entries(built).filter(([, value]) => value === undefined)).toEqual([]);
            });

        it.each(DTOS.filter(([name]) => REQUIRES_ITS_ARGUMENTS.has(name)))(
            "%s should leave unset what it has no default for",
            (_name, Dto) => {
                // Act
                const built = new Dto();

                // Assert
                expect(Object.values(built).every((value) => value === undefined)).toBe(true);
            });
    });

    describe("constructed with values", () => {
        it.each(DTOS)("%s should hold every value its constructor was given", (_name, Dto) => {
            // Arrange
            const values = sentinels(Dto.length);

            // Act
            const built = new Dto(...values);

            // Assert
            expect(Object.values(built)).toEqual(expect.arrayContaining(values));
        });

        it.each(DTOS)("%s should give each value a property of its own", (_name, Dto) => {
            // Arrange
            const values = sentinels(Dto.length);

            // Act
            const built = new Dto(...values);
            const held = Object.values(built).filter((value) => values.includes(value));

            // Assert
            expect(held).toHaveLength(values.length);
        });
    });
});

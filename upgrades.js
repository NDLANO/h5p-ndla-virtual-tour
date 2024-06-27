var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.EscapeRoom'] = (function () {
  return {
    0: {
      2: function (parameters, finished) {
        if (parameters && parameters.context &&
            parameters.context.behaviour && parameters.context.behaviour.length) {
          // Add wrapper for audio
          const audio = parameters.context.behaviour;
          parameters.context.behaviour = {
            audio: audio
          };
        }
        finished(null, parameters);
      },

      /**
       * @param {{ threeImage: {scenes: Array<SceneParams>}; behaviour?: any; }} parameters
       * @param {(param0: any, parameters: any) => void} finished
       */
      4: function (parameters, finished) {
        if (parameters && parameters.behaviour) {
          parameters.behaviour.label = {
            showLabel: false,
            labelPosition: 'right'
          };
        }

        if (parameters && parameters.threeImage && parameters.threeImage.scenes) {
          for (const scene of parameters.threeImage.scenes) {
            if (scene.interactions) {
              for (const interaction of scene.interactions) {
                if (!interaction.label) {
                  interaction.label = {
                    labelPosition: 'inherit',
                    showLabel: 'inherit',
                  };
                }
              }
            }
          }
        }

        finished(null, parameters);
      },
      /**
       * Move hotspot and password settings out of label group.
       * @param {object} parameters Parameters.
       * @param {function} finished Callback when finished.
       * @param {object} extras Extras such as metadata.
       */
      5: (parameters, finished, extras) => {
        if (Array.isArray(parameters?.threeImage?.scenes)) {
          parameters.threeImage.scenes = parameters.threeImage.scenes.map((scene) => {
            if (!Array.isArray(scene.interactions)) {
              return scene;
            }

            scene.interactions = scene.interactions.map((interaction) => {
              interaction.passwordSettings = {};
              interaction.hotspotSettings = {};

              if (interaction.label) {
                if (typeof interaction.label.showAsHotspot === 'boolean') {
                  interaction.showAsHotspot = !!interaction.label.showAsHotspot;
                }

                if (typeof interaction.label.showAsOpenSceneContent === 'boolean') {
                  interaction.showAsOpenSceneContent = interaction.label.showAsOpenSceneContent;
                }

                if (typeof interaction.label.interactionPassword === 'string') {
                  interaction.passwordSettings.interactionPassword = interaction.label.interactionPassword;
                }
                if (typeof interaction.label.interactionPasswordHint === 'string') {
                  interaction.passwordSettings.interactionPasswordHint = interaction.label.interactionPasswordHint;
                }

                if (typeof interaction.label.showHotspotOnHover === 'boolean') {
                  interaction.hotspotSettings.showHotspotOnHover = interaction.label.showHotspotOnHover;
                }

                if (typeof interaction.label.isHotspotTabbable === 'boolean') {
                  interaction.hotspotSettings.isHotspotTabbable = interaction.label.isHotspotTabbable;
                }

                if (scene.type === 'static') {
                  if (typeof interaction.label.hotSpotSizeValues === 'string') {
                    interaction.hotspotSettings.hotSpotSizeValues = interaction.label.hotSpotSizeValues;

                    if (interaction.hotspotSettings.hotSpotSizeValues === '256,128') {
                      interaction.hotspotSettings.hotSpotSizeValues = '25,25'; // Was previously done in view
                    }
                  }
                  else {
                    interaction.hotspotSettings.hotSpotSizeValues = '25,25'; // Was hardcoded into view
                  }
                }
                else {
                  if (typeof interaction.label.hotSpotSizeValues === 'string') {
                    interaction.hotspotSettings.hotSpotSizeValues = interaction.label.hotSpotSizeValues;
                  }
                  else {
                    interaction.hotspotSettings.hotSpotSizeValues = '256,128';
                  }
                }

                delete interaction.label.showAsHotspot;
                delete interaction.label.showAsOpenSceneContent;
                delete interaction.label.interactionPassword;
                delete interaction.label.interactionPasswordHint;
                delete interaction.label.showHotspotOnHover;
                delete interaction.label.isHotspotTabbable;
                delete interaction.label.hotSpotSizeValues;
              }
              else {
                interaction.label = {}; // Fixes old issue where this upgrade was forgotten
              }

              return interaction;
            });

            return scene;
          });
        }

        finished(null, parameters, extras);
      }
    }
  };
})();

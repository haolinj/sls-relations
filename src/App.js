import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import fp from 'lodash/fp';
import { compose, withHandlers, lifecycle, withStateHandlers } from 'recompose';
import { mainActions } from './state/modules/main';
import 'vis/dist/vis-network.min.css';
import './App.css';
import { renderGraph, renderSelectedNode } from './renderer';

const App =
  ({
    getServices,
    fileChangedHandler,
    togglePhysics,
    toggleLabel,
    toggleComplication,
    showLabel,
    enablePhysics,
    enableComplication,
    files,
    selectedNode
  }) =>
    (
      <div className='container-fluid'>
        <div className='row main'>
          <div className='col-sm-2'>
            {selectedNode ? renderSelectedNode(selectedNode) : null}
          </div>
          <div className='App col-sm-10'>
            <div className='controls'>
              <form onSubmit={getServices}>
                <label htmlFor='file-upload' className='btn btn-dark'>
                  Upload serverless.yml files
                </label>
                <input
                  id='file-upload'
                  type='file'
                  className='btn btn-dark'
                  onChange={fileChangedHandler}
                  multiple />
                <button type='submit' className='btn btn-info'>
                  Process {files.length > 0 ? `${files.length} services` : null}
                </button>
              </form>
              <button className={enablePhysics ? 'btn btn-success' : 'btn btn-secondary'}
                onClick={togglePhysics}>
                {enablePhysics ? 'Disable' : 'Enable'} Physics
              </button>
              <button className={showLabel ? 'btn btn-success' : 'btn btn-secondary'}
                onClick={toggleLabel}>
                {showLabel ? 'Hide' : 'Show'} dependency properties
              </button>
              <button className={enableComplication ? 'btn btn-success' : 'btn btn-secondary'}
                onClick={toggleComplication}>
                {enableComplication ? 'Disable' : 'Enable'} detailed view
              </button>
            </div>
            <div id='output'></div>
          </div>
        </div>
      </div>
    );

const mapStateToProps = (state) => ({
  services: state.main.services
});

const mapDispatchToProps = (dispatch) => ({
  fetchServices: bindActionCreators(mainActions.main.fetchServices, dispatch)
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withStateHandlers(
    {
      enablePhysics: true,
      showLabel: false,
      enableComplication: false,
      files: [],
      selectedNode: undefined
    },
    {
      setFinished: () => (finished) => ({ finished }),
      togglePhysics: ({ enablePhysics }) => () => ({
        enablePhysics: !enablePhysics,
        selectedNode: undefined
      }),
      toggleLabel: ({ showLabel }) => () => ({
        showLabel: !showLabel,
        selectedNode: undefined
      }),
      toggleComplication: ({ enableComplication }) => () => ({
        enableComplication: !enableComplication,
        selectedNode: undefined
      }),
      fileChangedHandler: () => (event) => ({ files: event.target.files }),
      setSelectedNode: () => (selectedNode) => ({ selectedNode })
    }
  ),
  withHandlers({
    getServices: ({ fetchServices, files }) => (e) => {
      e.preventDefault();
      fetchServices(files);
    },
    onNodeSelected: ({ setSelectedNode }) => (dependencies) => (e) => {
      const serviceName = fp.first(e.nodes);
      const selectedService = fp.find(dep => dep.name === serviceName)(dependencies);
      setSelectedNode(selectedService);
    }
  }),
  lifecycle({
    componentDidUpdate() {
      const { onNodeSelected, services, enablePhysics, showLabel, enableComplication, selectedNode } = this.props;
      if (services && services.length > 0 && !selectedNode) {
        renderGraph(services, enablePhysics, showLabel, enableComplication, onNodeSelected);
      }
    }
  })
)(App);
